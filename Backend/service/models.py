"""
Models for service app - Service requests
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from accounts.models import User
from inventory.models import Vehicle


class ServiceRequest(models.Model):
    """ServiceRequest model for vehicle maintenance"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='service_requests',
        limit_choices_to={'role': 'customer'}
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='service_requests'
    )
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    date = models.DateTimeField(auto_now_add=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_services',
        limit_choices_to={'role': 'admin'}
    )
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Service Request'
        verbose_name_plural = 'Service Requests'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['customer', 'date']),
            models.Index(fields=['status', 'date']),
            models.Index(fields=['vehicle']),
        ]
    
    def __str__(self):
        return f"Service #{self.id} - {self.customer.name} - {self.vehicle.brand} {self.vehicle.model}"
    
    def update_status(self, new_status, admin_user=None):
        """Update service status"""
        if new_status not in dict(self.STATUS_CHOICES):
            return False
        
        self.status = new_status
        
        from django.utils import timezone
        if new_status == 'completed':
            self.completed_date = timezone.now()
            if admin_user:
                self.assigned_to = admin_user
        elif new_status == 'in_progress':
            if admin_user:
                self.assigned_to = admin_user
        
        self.save()
        return True
