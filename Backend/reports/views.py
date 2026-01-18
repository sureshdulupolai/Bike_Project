"""
Views for reports app - Reporting APIs
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta, datetime

from accounts.permissions import IsAdmin
from sales.models import Sale
from inventory.models import Vehicle
from service.models import ServiceRequest


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def sales_report(request):
    """
    GET /api/reports/sales/
    Generate sales report (Admin only)
    
    Query Parameters:
    - start_date: Start date (YYYY-MM-DD)
    - end_date: End date (YYYY-MM-DD)
    - status: Filter by sale status (pending, verified, cancelled)
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    status_filter = request.query_params.get('status')
    
    queryset = Sale.objects.select_related('customer', 'vehicle').all()
    
    # Filter by date range
    if start_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            queryset = queryset.filter(date__gte=start_date)
        except ValueError:
            return Response({
                'error': 'Invalid start_date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    if end_date:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            # Include the entire end date
            end_date = end_date + timedelta(days=1)
            queryset = queryset.filter(date__lt=end_date)
        except ValueError:
            return Response({
                'error': 'Invalid end_date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Filter by status
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    # Calculate statistics
    total_sales = queryset.count()
    verified_sales = queryset.filter(status='verified').count()
    pending_sales = queryset.filter(status='pending').count()
    cancelled_sales = queryset.filter(status='cancelled').count()
    
    total_revenue = queryset.filter(status='verified').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    total_quantity = queryset.filter(status='verified').aggregate(
        total=Sum('quantity')
    )['total'] or 0
    
    average_sale_amount = queryset.filter(status='verified').aggregate(
        avg=Avg('amount')
    )['avg'] or 0
    
    # Top selling vehicles
    top_vehicles = queryset.filter(status='verified').values(
        'vehicle__brand', 'vehicle__model'
    ).annotate(
        total_sold=Sum('quantity'),
        total_revenue=Sum('amount')
    ).order_by('-total_sold')[:10]
    
    # Sales by status
    sales_by_status = queryset.values('status').annotate(
        count=Count('id'),
        total_amount=Sum('amount')
    )
    
    return Response({
        'period': {
            'start_date': start_date.strftime('%Y-%m-%d') if start_date else None,
            'end_date': end_date.strftime('%Y-%m-%d') if end_date else None,
        },
        'summary': {
            'total_sales': total_sales,
            'verified_sales': verified_sales,
            'pending_sales': pending_sales,
            'cancelled_sales': cancelled_sales,
            'total_revenue': float(total_revenue),
            'total_quantity_sold': total_quantity,
            'average_sale_amount': float(average_sale_amount),
        },
        'top_vehicles': list(top_vehicles),
        'sales_by_status': list(sales_by_status),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def inventory_report(request):
    """
    GET /api/reports/inventory/
    Generate inventory report (Admin only)
    
    Query Parameters:
    - low_stock: Filter vehicles with stock below threshold (default: 10)
    - brand: Filter by brand
    """
    low_stock_threshold = int(request.query_params.get('low_stock', 10))
    brand_filter = request.query_params.get('brand')
    
    queryset = Vehicle.objects.all()
    
    if brand_filter:
        queryset = queryset.filter(brand__icontains=brand_filter)
    
    # Calculate statistics
    total_vehicles = queryset.count()
    active_vehicles = queryset.filter(is_active=True).count()
    in_stock_vehicles = queryset.filter(stock_qty__gt=0).count()
    low_stock_vehicles = queryset.filter(
        stock_qty__gt=0,
        stock_qty__lte=low_stock_threshold
    ).count()
    out_of_stock_vehicles = queryset.filter(stock_qty=0).count()
    
    total_stock_value = queryset.aggregate(
        total=Sum('price') * Sum('stock_qty')
    )['total'] or 0
    
    # Calculate stock value properly
    stock_value = sum(vehicle.price * vehicle.stock_qty for vehicle in queryset)
    
    # Inventory by brand
    inventory_by_brand = queryset.values('brand').annotate(
        total_models=Count('id'),
        total_stock=Sum('stock_qty'),
        avg_price=Avg('price')
    ).order_by('-total_stock')
    
    # Low stock vehicles
    low_stock_list = queryset.filter(
        stock_qty__gt=0,
        stock_qty__lte=low_stock_threshold
    ).values('id', 'brand', 'model', 'stock_qty', 'price').order_by('stock_qty')
    
    # Out of stock vehicles
    out_of_stock_list = queryset.filter(stock_qty=0).values(
        'id', 'brand', 'model', 'price'
    )
    
    return Response({
        'summary': {
            'total_vehicles': total_vehicles,
            'active_vehicles': active_vehicles,
            'in_stock_vehicles': in_stock_vehicles,
            'low_stock_vehicles': low_stock_vehicles,
            'out_of_stock_vehicles': out_of_stock_vehicles,
            'total_stock_value': float(stock_value),
        },
        'inventory_by_brand': list(inventory_by_brand),
        'low_stock_vehicles': list(low_stock_list),
        'out_of_stock_vehicles': list(out_of_stock_list),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def service_report(request):
    """
    GET /api/reports/service/
    Generate service report (Admin only)
    
    Query Parameters:
    - start_date: Start date (YYYY-MM-DD)
    - end_date: End date (YYYY-MM-DD)
    - status: Filter by service status
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    status_filter = request.query_params.get('status')
    
    queryset = ServiceRequest.objects.select_related('customer', 'vehicle').all()
    
    # Filter by date range
    if start_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            queryset = queryset.filter(date__gte=start_date)
        except ValueError:
            return Response({
                'error': 'Invalid start_date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    if end_date:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            end_date = end_date + timedelta(days=1)
            queryset = queryset.filter(date__lt=end_date)
        except ValueError:
            return Response({
                'error': 'Invalid end_date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Filter by status
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    # Calculate statistics
    total_requests = queryset.count()
    pending_requests = queryset.filter(status='pending').count()
    in_progress_requests = queryset.filter(status='in_progress').count()
    completed_requests = queryset.filter(status='completed').count()
    cancelled_requests = queryset.filter(status='cancelled').count()
    
    total_revenue = queryset.filter(status='completed').aggregate(
        total=Sum('cost')
    )['total'] or 0
    
    average_cost = queryset.filter(status='completed').aggregate(
        avg=Avg('cost')
    )['avg'] or 0
    
    # Services by status
    services_by_status = queryset.values('status').annotate(
        count=Count('id'),
        total_revenue=Sum('cost')
    )
    
    # Services by vehicle brand
    services_by_brand = queryset.values('vehicle__brand').annotate(
        count=Count('id'),
        total_revenue=Sum('cost')
    ).order_by('-count')
    
    return Response({
        'period': {
            'start_date': start_date.strftime('%Y-%m-%d') if start_date else None,
            'end_date': end_date.strftime('%Y-%m-%d') if end_date else None,
        },
        'summary': {
            'total_requests': total_requests,
            'pending_requests': pending_requests,
            'in_progress_requests': in_progress_requests,
            'completed_requests': completed_requests,
            'cancelled_requests': cancelled_requests,
            'total_revenue': float(total_revenue),
            'average_cost': float(average_cost),
        },
        'services_by_status': list(services_by_status),
        'services_by_brand': list(services_by_brand),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def dashboard_summary(request):
    """
    GET /api/reports/dashboard/
    Get dashboard summary with key metrics (Admin only)
    """
    # Sales metrics (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    recent_sales = Sale.objects.filter(
        date__gte=thirty_days_ago,
        status='verified'
    )
    sales_count = recent_sales.count()
    sales_revenue = recent_sales.aggregate(total=Sum('amount'))['total'] or 0
    
    # Inventory metrics
    total_vehicles = Vehicle.objects.filter(is_active=True).count()
    low_stock_count = Vehicle.objects.filter(
        is_active=True,
        stock_qty__gt=0,
        stock_qty__lte=10
    ).count()
    out_of_stock_count = Vehicle.objects.filter(
        is_active=True,
        stock_qty=0
    ).count()
    
    # Service metrics (last 30 days)
    recent_services = ServiceRequest.objects.filter(date__gte=thirty_days_ago)
    pending_services = recent_services.filter(status='pending').count()
    completed_services = recent_services.filter(status='completed').count()
    service_revenue = recent_services.filter(
        status='completed'
    ).aggregate(total=Sum('cost'))['total'] or 0
    
    # Customer metrics
    from accounts.models import User
    total_customers = User.objects.filter(role='customer', is_active=True).count()
    new_customers = User.objects.filter(
        role='customer',
        created_at__gte=thirty_days_ago
    ).count()
    
    return Response({
        'sales': {
            'recent_sales_count': sales_count,
            'recent_revenue': float(sales_revenue),
        },
        'inventory': {
            'total_vehicles': total_vehicles,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
        },
        'service': {
            'pending_requests': pending_services,
            'completed_services': completed_services,
            'recent_revenue': float(service_revenue),
        },
        'customers': {
            'total_customers': total_customers,
            'new_customers': new_customers,
        },
    }, status=status.HTTP_200_OK)
