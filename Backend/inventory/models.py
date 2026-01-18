"""
Models for inventory app - Vehicle management
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Vehicle(models.Model):
    """Vehicle model for 2-wheeler inventory"""
    
    id = models.BigAutoField(primary_key=True)
    brand = models.CharField(max_length=100, db_index=True)
    model = models.CharField(max_length=100, db_index=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    stock_qty = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='vehicles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
        ordering = ['-created_at']
        unique_together = ['brand', 'model']
        indexes = [
            models.Index(fields=['brand', 'model']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.brand} {self.model} - ₹{self.price}"
    
    def reduce_stock(self, quantity):
        """Reduce stock quantity"""
        if self.stock_qty >= quantity:
            self.stock_qty -= quantity
            self.save()
            return True
        return False
    
    def add_stock(self, quantity):
        """Add stock quantity"""
        self.stock_qty += quantity
        self.save()
        return True
    
    @property
    def is_in_stock(self):
        """Check if vehicle is in stock"""
        return self.stock_qty > 0
