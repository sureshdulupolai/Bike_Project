"""
Views for inventory app - Vehicle CRUD APIs
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Vehicle
from .serializers import VehicleSerializer, VehicleCreateSerializer, VehicleListSerializer
from accounts.permissions import IsAdmin, IsAdminOrReadOnly


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Vehicle management
    
    GET /api/inventory/vehicles/ - List all vehicles (Public)
    GET /api/inventory/vehicles/{id}/ - Get vehicle details (Public)
    POST /api/inventory/vehicles/ - Create vehicle (Admin only)
    PUT /api/inventory/vehicles/{id}/ - Update vehicle (Admin only)
    PATCH /api/inventory/vehicles/{id}/ - Partial update (Admin only)
    DELETE /api/inventory/vehicles/{id}/ - Delete vehicle (Admin only)
    """
    queryset = Vehicle.objects.filter(is_active=True)
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'is_active']
    search_fields = ['brand', 'model', 'description']
    ordering_fields = ['price', 'created_at', 'stock_qty']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return VehicleCreateSerializer
        elif self.action == 'list':
            return VehicleListSerializer
        return VehicleSerializer
    
    def get_permissions(self):
        """Override permissions for list and retrieve"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        queryset = Vehicle.objects.all()
        
        # Customers see only active vehicles
        if not self.request.user.is_authenticated or self.request.user.role == 'customer':
            queryset = queryset.filter(is_active=True)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def update_stock(self, request, pk=None):
        """
        POST /api/inventory/vehicles/{id}/update_stock/
        Update stock quantity (Admin only)
        """
        vehicle = self.get_object()
        quantity = request.data.get('quantity')
        action_type = request.data.get('action', 'add')  # 'add' or 'reduce'
        
        if quantity is None:
            return Response({
                'error': 'Quantity is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError("Quantity must be positive.")
        except (ValueError, TypeError):
            return Response({
                'error': 'Invalid quantity. Must be a positive integer.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if action_type == 'reduce':
            if vehicle.reduce_stock(quantity):
                return Response({
                    'message': f'Stock reduced by {quantity}.',
                    'vehicle': VehicleSerializer(vehicle).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Insufficient stock.'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            vehicle.add_stock(quantity)
            return Response({
                'message': f'Stock increased by {quantity}.',
                'vehicle': VehicleSerializer(vehicle).data
            }, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete - set is_active to False"""
        vehicle = self.get_object()
        vehicle.is_active = False
        vehicle.save()
        return Response({
            'message': 'Vehicle deactivated successfully.'
        }, status=status.HTTP_200_OK)
