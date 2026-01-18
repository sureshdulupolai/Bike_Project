"""
Views for sales app - Purchase and sales management APIs
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Sale
from .serializers import SaleSerializer, SaleCreateSerializer, SaleListSerializer
from accounts.permissions import IsAdmin, IsCustomer


class SaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Sale management
    
    GET /api/sales/sales/ - List sales (Admin: all, Customer: own)
    GET /api/sales/sales/{id}/ - Get sale details
    POST /api/sales/sales/ - Create sale (Purchase vehicle)
    PATCH /api/sales/sales/{id}/verify/ - Verify sale (Admin only)
    PATCH /api/sales/sales/{id}/cancel/ - Cancel sale
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vehicle', 'customer']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return SaleCreateSerializer
        elif self.action == 'list':
            return SaleListSerializer
        return SaleSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        queryset = Sale.objects.select_related('customer', 'vehicle', 'verified_by').all()
        
        # Customers see only their own sales
        if self.request.user.role == 'customer':
            queryset = queryset.filter(customer=self.request.user)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new sale (Purchase vehicle)"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        sale = serializer.save()
        
        return Response({
            'message': 'Vehicle purchase request created successfully. Waiting for admin verification.',
            'sale': SaleSerializer(sale).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdmin])
    def verify(self, request, pk=None):
        """
        PATCH /api/sales/sales/{id}/verify/
        Verify sale and reduce stock (Admin only)
        """
        sale = self.get_object()
        
        if sale.status != 'pending':
            return Response({
                'error': f'Sale is already {sale.status}.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if sale.verify(request.user):
            return Response({
                'message': 'Sale verified successfully. Stock has been reduced.',
                'sale': SaleSerializer(sale).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to verify sale. Insufficient stock.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """
        PATCH /api/sales/sales/{id}/cancel/
        Cancel sale (Customer: own sales, Admin: any sale)
        """
        sale = self.get_object()
        
        # Customers can only cancel their own pending sales
        if request.user.role == 'customer' and sale.customer != request.user:
            return Response({
                'error': 'You can only cancel your own sales.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if sale.status == 'cancelled':
            return Response({
                'error': 'Sale is already cancelled.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if sale.status == 'verified':
            # Only admin can cancel verified sales
            if request.user.role != 'admin':
                return Response({
                    'error': 'Only admin can cancel verified sales.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        sale.cancel()
        
        return Response({
            'message': 'Sale cancelled successfully.',
            'sale': SaleSerializer(sale).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsCustomer])
    def my_purchases(self, request):
        """
        GET /api/sales/sales/my_purchases/
        Get current customer's purchase history
        """
        sales = self.get_queryset().filter(customer=request.user)
        serializer = self.get_serializer(sales, many=True)
        return Response({
            'count': sales.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
