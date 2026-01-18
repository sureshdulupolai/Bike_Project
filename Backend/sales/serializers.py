"""
Serializers for sales app
"""
from rest_framework import serializers
from .models import Sale
from inventory.serializers import VehicleListSerializer
from accounts.serializers import UserSerializer


class SaleSerializer(serializers.ModelSerializer):
    """Serializer for Sale model"""
    vehicle_details = VehicleListSerializer(source='vehicle', read_only=True)
    customer_details = serializers.SerializerMethodField()
    verified_by_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = [
            'id', 'customer', 'customer_details', 'vehicle', 'vehicle_details',
            'amount', 'quantity', 'status', 'date', 'verified_at',
            'verified_by', 'verified_by_details', 'notes'
        ]
        read_only_fields = [
            'id', 'date', 'verified_at', 'verified_by', 'status'
        ]
    
    def get_customer_details(self, obj):
        """Get customer details"""
        return {
            'id': obj.customer.id,
            'name': obj.customer.name,
            'email': obj.customer.email,
            'mobile': obj.customer.mobile
        }
    
    def get_verified_by_details(self, obj):
        """Get verified by admin details"""
        if obj.verified_by:
            return {
                'id': obj.verified_by.id,
                'name': obj.verified_by.name,
                'email': obj.verified_by.email
            }
        return None
    
    def validate(self, attrs):
        """Validate sale data"""
        vehicle = attrs.get('vehicle')
        quantity = attrs.get('quantity', 1)
        
        if vehicle:
            # Check stock availability
            if vehicle.stock_qty < quantity:
                raise serializers.ValidationError({
                    'quantity': f'Only {vehicle.stock_qty} units available in stock.'
                })
            
            # Set amount based on vehicle price
            if 'amount' not in attrs or not attrs['amount']:
                attrs['amount'] = vehicle.price * quantity
        
        return attrs


class SaleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a sale"""
    class Meta:
        model = Sale
        fields = ['id', 'vehicle', 'quantity', 'notes']
        read_only_fields = ['id']
    
    def validate(self, attrs):
        """Validate sale creation"""
        vehicle = attrs.get('vehicle')
        quantity = attrs.get('quantity', 1)
        
        if not vehicle.is_active:
            raise serializers.ValidationError({
                'vehicle': 'This vehicle is not available for sale.'
            })
        
        if vehicle.stock_qty < quantity:
            raise serializers.ValidationError({
                'quantity': f'Only {vehicle.stock_qty} units available in stock.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create sale with customer from request"""
        validated_data['customer'] = self.context['request'].user
        validated_data['amount'] = validated_data['vehicle'].price * validated_data.get('quantity', 1)
        return super().create(validated_data)


class SaleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for sale listing"""
    vehicle_name = serializers.CharField(source='vehicle.__str__', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'customer_name', 'vehicle_name', 'amount',
            'quantity', 'status', 'date'
        ]
