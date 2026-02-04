"""
Views for service app - Service booking and management APIs
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import ServiceRequest
from .serializers import (
    ServiceRequestSerializer,
    ServiceRequestCreateSerializer,
    ServiceRequestListSerializer,
    ServiceRequestUpdateSerializer
)
from inventory.serializers import VehicleListSerializer
from sales.models import Sale
from accounts.permissions import IsAdmin, IsCustomer


class ServiceRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ServiceRequest management
    
    GET /api/service/requests/ - List service requests (Admin: all, Customer: own)
    GET /api/service/requests/{id}/ - Get service request details
    POST /api/service/requests/ - Create service request (Book service)
    PATCH /api/service/requests/{id}/ - Update service request (Admin only)
    PATCH /api/service/requests/{id}/update_status/ - Update status (Admin only)
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vehicle', 'customer']
    search_fields = ['description', 'notes']
    ordering_fields = ['date', 'cost', 'scheduled_date']
    ordering = ['-date']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ServiceRequestCreateSerializer
        elif self.action == 'list':
            return ServiceRequestSerializer   
        elif self.action == 'update' or self.action == 'partial_update':
            return ServiceRequestUpdateSerializer
        return ServiceRequestSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        queryset = ServiceRequest.objects.select_related(
            'customer', 'vehicle', 'assigned_to'
        ).all()
        
        # Customers see only their own service requests
        if self.request.user.role == 'customer':
            queryset = queryset.filter(customer=self.request.user)
        
        return queryset
    
    def get_permissions(self):
        """Override permissions for update actions"""
        if self.action in ['update', 'partial_update', 'update_status']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """Create a new service request (Book service)"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        service_request = serializer.save()
        
        return Response({
            'message': 'Service request created successfully.',
            'service_request': ServiceRequestSerializer(service_request).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdmin])
    def update_status(self, request, pk=None):
        """
        PATCH /api/service/requests/{id}/update_status/
        Update service request status (Admin only)
        """
        service_request = self.get_object()
        new_status = request.data.get('status')
        cost = request.data.get('cost')
        notes = request.data.get('notes')
        
        if not new_status:
            return Response({
                'error': 'Status is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in dict(ServiceRequest.STATUS_CHOICES):
            return Response({
                'error': 'Invalid status.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update cost if provided
        if cost is not None:
            try:
                service_request.cost = float(cost)
            except (ValueError, TypeError):
                return Response({
                    'error': 'Invalid cost value.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update notes if provided
        if notes is not None:
            service_request.notes = notes
        
        # Update status
        if service_request.update_status(new_status, request.user):
            return Response({
                'message': f'Service request status updated to {new_status}.',
                'service_request': ServiceRequestSerializer(service_request).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to update status.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsCustomer])
    def my_services(self, request):
        """
        GET /api/service/requests/my_services/
        Get current customer's service history
        """
        service_requests = self.get_queryset().filter(customer=request.user)
        serializer = self.get_serializer(service_requests, many=True)
        return Response({
            'count': service_requests.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsCustomer])
    def eligible_vehicles(self, request):
        """
        GET /api/service/requests/eligible_vehicles/
        Get vehicles eligible for service (Purchased by customer)
        """
        # Get all vehicles where user has a verified sale
        sales = Sale.objects.filter(customer=request.user, status='verified').select_related('vehicle')
        vehicles = [sale.vehicle for sale in sales]
        
        serializer = VehicleListSerializer(vehicles, many=True)
        return Response({
            'count': len(vehicles),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsCustomer])
    def cancel(self, request, pk=None):
        """
        PATCH /api/service/requests/{id}/cancel/
        Cancel service request (Customer: own requests only)
        """
        service_request = self.get_object()
        
        # Customers can only cancel their own pending requests
        if service_request.customer != request.user:
            return Response({
                'error': 'You can only cancel your own service requests.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.status == 'cancelled':
            return Response({
                'error': 'Service request is already cancelled.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if service_request.status not in ['pending']:
            return Response({
                'error': 'Only pending service requests can be cancelled.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        service_request.update_status('cancelled')
        
        return Response({
            'message': 'Service request cancelled successfully.',
            'service_request': ServiceRequestSerializer(service_request).data
        }, status=status.HTTP_200_OK)
