from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Log
import json

# Función para obtener los logs con paginación y filtros
def get_logs(request):
    # Parámetros opcionales de búsqueda
    year = request.GET.get('year', None)
    month = request.GET.get('month', None)
    day = request.GET.get('day', None)
    event = request.GET.get('event', None)
    recipient = request.GET.get('recipient', None)
    sender_mask = request.GET.get('sender_mask', None)
    
    # Obtener todos los logs ordenados por fecha
    logs_list = Log.objects.all().order_by('-date')

    # Filtros de búsqueda por fecha
    if year:
        try:
            logs_list = logs_list.filter(date__year=2000 + int(year))
        except ValueError:
            return JsonResponse({'error': 'Invalid year format'}, status=400)
    
    if month:
        try:
            logs_list = logs_list.filter(date__month=int(month))
        except ValueError:
            return JsonResponse({'error': 'Invalid month format'}, status=400)
    
    if day:
        try:
            logs_list = logs_list.filter(date__day=int(day))
        except ValueError:
            return JsonResponse({'error': 'Invalid day format'}, status=400)
    
    # Filtros por evento, destinatario y remitente
    if event:
        logs_list = logs_list.filter(event=event)
    
    if recipient:
        logs_list = logs_list.filter(recipient__icontains=recipient)
    
    if sender_mask:
        logs_list = logs_list.filter(sender_mask__icontains=sender_mask)

    # Paginación
    paginator = Paginator(logs_list, 50)
    page_number = request.GET.get('page', 1)
    
    try:
        page_obj = paginator.get_page(page_number)
    except ValueError:
        return JsonResponse({'error': 'Invalid page number'}, status=400)

    # Procesar los logs
    logs_data = []
    for log in page_obj.object_list:
        subject = "N/A"
        sender = "N/A"
        message_data = log.message

        # Log para verificar el procesamiento
        print(f"Processing log ID: {log.id}, message_data type: {type(message_data)}, message_data: {message_data}")

        # Intentar decodificar el JSON en message_data
        if isinstance(message_data, str):
            try:
                message_data = json.loads(message_data)
                print(f"Decoded message_data for log ID {log.id}: {message_data}")
            except json.JSONDecodeError:
                print(f"Error decoding JSON for log ID: {log.id}")
                message_data = {}
        else:
            if not isinstance(message_data, dict):
                message_data = {}

        # Extraer headers
        headers = message_data.get('headers', None)
        if headers:
            if isinstance(headers, str):
                try:
                    headers = headers.replace("'", "\"")
                    headers = json.loads(headers)
                except json.JSONDecodeError:
                    print(f"Error decoding headers for log ID: {log.id}")
                    headers = {}
            subject = headers.get('subject', 'N/A')
            sender = headers.get('from', 'N/A')
        else:
            print(f"No headers present for log ID: {log.id}")

        # Agregar datos al log
        logs_data.append({
            'id': log.id,
            'date': log.date,
            'event': log.event,
            'recipient': log.recipient,
            'url': log.url,
            'subject': subject,
            'from': sender,
        })

    # Respuesta final
    data = {
        'logs': logs_data,
        'total_pages': paginator.num_pages
    }

    return JsonResponse(data, safe=False)

# Función para obtener eventos distintos
def get_events(request):
    events = Log.objects.values_list('event', flat=True).distinct()
    return JsonResponse({"events": list(events)}, safe=False)