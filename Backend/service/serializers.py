"""
Serializers for service app
"""
from rest_framework import serializers
from .models import ServiceRequest
from inventory.serializers import VehicleListSerializer
from accounts.serializers import UserSerializer


class ServiceRequestSerializer(serializers.ModelSerializer):
    """Serializer for ServiceRequest model"""
    vehicle_details = VehicleListSerializer(source='vehicle', read_only=True)
    customer_details = serializers.SerializerMethodField()
    assigned_to_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'customer', 'customer_details', 'vehicle', 'vehicle_details',
            'description', 'status', 'cost', 'date', 'scheduled_date',
            'completed_date', 'assigned_to', 'assigned_to_details', 'notes'
        ]
        read_only_fields = [
            'id', 'date', 'completed_date', 'assigned_to', 'status'
        ]
    
    def get_customer_details(self, obj):
        """Get customer details"""
        return {
            'id': obj.customer.id,
            'name': obj.customer.name,
            'email': obj.customer.email,
            'mobile': obj.customer.mobile
        }
    
    def get_assigned_to_details(self, obj):
        """Get assigned admin details"""
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'name': obj.assigned_to.name,
                'email': obj.assigned_to.email
            }
        return None
    
    def validate_cost(self, value):
        """Validate cost"""
        if value < 0:
            raise serializers.ValidationError("Cost cannot be negative.")
        return value


class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a service request"""
    class Meta:
        model = ServiceRequest
        fields = ['id', 'vehicle', 'description', 'scheduled_date', 'notes']
        read_only_fields = ['id']
    
    def validate(self, attrs):
        """Validate service request creation"""
        vehicle = attrs.get('vehicle')
        
        if not vehicle.is_active:
            raise serializers.ValidationError({
                'vehicle': 'This vehicle is not available.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create service request with customer from request"""
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


class ServiceRequestListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for service request listing"""
    vehicle_name = serializers.CharField(source='vehicle.__str__', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'customer_name', 'vehicle_name', 'description',
            'status', 'cost', 'date', 'scheduled_date'
        ]


class ServiceRequestUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating service request (Admin only)"""
    class Meta:
        model = ServiceRequest
        fields = [
            'status', 'cost', 'scheduled_date', 'assigned_to', 'notes'
        ]
    
    def validate_status(self, value):
        """Validate status transitions"""
        if value not in dict(ServiceRequest.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status.")
        return value
