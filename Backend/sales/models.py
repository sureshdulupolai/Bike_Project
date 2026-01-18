"""
Models for sales app - Sales transactions
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from accounts.models import User
from inventory.models import Vehicle


class Sale(models.Model):
    """Sale model for vehicle purchases"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='purchases',
        limit_choices_to={'role': 'customer'}
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_sales',
        limit_choices_to={'role': 'admin'}
    )
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Sale'
        verbose_name_plural = 'Sales'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['customer', 'date']),
            models.Index(fields=['status', 'date']),
            models.Index(fields=['vehicle']),
        ]
    
    def __str__(self):
        return f"Sale #{self.id} - {self.customer.name} - {self.vehicle.brand} {self.vehicle.model}"
    
    def verify(self, admin_user):
        """Verify sale and update stock"""
        if self.status != 'pending':
            return False
        
        # Reduce stock
        if self.vehicle.reduce_stock(self.quantity):
            self.status = 'verified'
            from django.utils import timezone
            self.verified_at = timezone.now()
            self.verified_by = admin_user
            self.save()
            return True
        return False
    
    def cancel(self):
        """Cancel sale and restore stock"""
        if self.status == 'verified':
            # Restore stock
            self.vehicle.add_stock(self.quantity)
        
        self.status = 'cancelled'
        self.save()
        return True
