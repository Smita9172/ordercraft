from rest_framework.permissions import BasePermission, SAFE_METHODS


class RolePermission(BasePermission):
    """Admin: sab. Baaki: dekh sakte hain, likh sirf view.write_roles wale."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or user.role == "ADMIN":
            return True
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return user.role in getattr(view, "write_roles", ())
    