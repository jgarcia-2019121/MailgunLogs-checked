from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Log
import json
from django.utils import timezone

# Función para obtener los logs con paginación y filtros
def get_logs(request):
    # Parámetros opcionales de búsqueda
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)
    
    # Convertir las fechas si se proporcionan
    if start_date:
        try:
            start_date = timezone.datetime.fromisoformat(start_date)
        except ValueError:
            return JsonResponse({'error': 'Invalid start date format'}, status=400)

    if end_date:
        try:
            end_date = timezone.datetime.fromisoformat(end_date)
        except ValueError:
            return JsonResponse({'error': 'Invalid end date format'}, status=400)

    event = request.GET.get('event', None)
    recipient = request.GET.get('recipient', None)
    sender_mask = request.GET.get('sender', None)
    subject = request.GET.get('subject', None)

    # Obtener todos los logs ordenados por fecha
    logs_list = Log.objects.all().order_by('-date')

    # Filtros de búsqueda por rango de fechas
    if start_date and end_date:
        logs_list = logs_list.filter(date__range=(start_date, end_date))
    elif start_date:
        logs_list = logs_list.filter(date__gte=start_date)
    elif end_date:
        logs_list = logs_list.filter(date__lte=end_date)

    # Filtros por evento, destinatario y remitente
    if event:
        logs_list = logs_list.filter(event=event)
    
    if recipient:
        logs_list = logs_list.filter(recipient__icontains=recipient)
    
    if sender_mask:
        logs_list = logs_list.filter(message__icontains=sender_mask)
    
    if subject:
        logs_list = logs_list.filter(message__icontains=subject)
    
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

        # Intentar decodificar el JSON en message_data
        try:
            message_json = json.loads(message_data.replace('\'','"'))
            if isinstance(message_json, dict):
                headers = message_json.get('headers', '{}')
            else:
                headers = message_json
            try:
                subject = headers.get('subject', 'N/A')
                sender = headers.get('from', 'N/A')
            except (json.JSONDecodeError, TypeError):
                pass
        except:
            try:
                start = message_data.index('\'subject\': ')+11
                end = message_data.find(',', start)
                subject = message_data[start:end].replace('\'','').replace('}"','')
            except:
                pass
            try:
                start = message_data.index('\'from\': ')+8
                end = message_data.find(',', start)
                sender = message_data[start:end].replace('\'','').replace('}"','')
            except:
                pass

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
