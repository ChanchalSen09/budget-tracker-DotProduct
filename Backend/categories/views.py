from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .models import Category
from .serializers import CategorySerializer


@extend_schema(tags=['Categories'])
class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing income and expense categories.
    
    list: Get all user's categories with filtering and search
    create: Create a new category
    retrieve: Get a specific category
    update: Update a category
    partial_update: Partially update a category
    destroy: Delete a category
    """
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    @extend_schema(
        summary="List all categories",
        description="Get paginated list of user's categories. Supports filtering by type and search.",
        parameters=[
            OpenApiParameter('type', OpenApiTypes.STR, description='Filter by INCOME or EXPENSE'),
            OpenApiParameter('is_active', OpenApiTypes.BOOL, description='Filter active categories'),
            OpenApiParameter('search', OpenApiTypes.STR, description='Search by name'),
            OpenApiParameter('ordering', OpenApiTypes.STR, description='Order by field (e.g., -created_at)'),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create category",
        description="Create a new income or expense category.",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Get category",
        description="Retrieve a specific category by ID.",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update category",
        description="Update all fields of a category.",
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial update category",
        description="Update specific fields of a category.",
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete category",
        description="Delete a category permanently.",
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)