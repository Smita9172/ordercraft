from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomTokenSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)