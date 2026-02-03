"""
Serializers for inventory app
"""
from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    is_in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand', 'model', 'price', 'stock_qty',
            'description', 'image', 'is_in_stock', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_price(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate_stock_qty(self, value):
        """Validate stock quantity"""
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicles (Admin only)"""
    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand', 'model', 'price', 'stock_qty',
            'description', 'image', 'is_active'
        ]
        read_only_fields = ['id']
    
    def validate(self, attrs):
        """Validate brand and model combination"""
        brand = attrs.get('brand')
        model = attrs.get('model')
        
        if brand and model:
            # Check for duplicate brand-model combination
            existing = Vehicle.objects.filter(
                brand__iexact=brand,
                model__iexact=model
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing.exists():
                raise serializers.ValidationError({
                    "model": "A vehicle with this brand and model already exists."
                })
        
        return attrs


class VehicleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for vehicle listing"""
    is_in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand', 'model', 'price', 'stock_qty',
            'description', 'is_in_stock', 'is_active', 'image'
        ]
