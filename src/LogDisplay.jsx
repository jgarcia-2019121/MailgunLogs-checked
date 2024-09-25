import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './LogDisplay.css';

const LogDisplay = () => {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(''); // Date format: 'yyyy-mm-dd'
  const [event, setEvent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventOptions, setEventOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Estado de loading

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true); // Iniciar el estado de loading
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:8000/get-logs/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          date: date ? formatToBackendDate(date) : null, // Converting to 'yyyy-mm-dd'
          event: event || null,
          recipient: recipient || null,
          sender: sender || null,
          subject: subject || null,
          page: page,
        },
      });

      setLogs(response.data.logs || []);
      setTotalPages(response.data.total_pages || 1);
      setIsLoading(false); // Termina el estado de loading cuando los datos se cargan
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setTotalPages(1);
      setIsLoading(false); // Termina el estado de loading en caso de error
    }
  }, [date, event, recipient, sender, subject, page]);

  const fetchEventOptions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:8000/get-events/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEventOptions(response.data.events || []);
    } catch (error) {
      console.error('Error fetching event options:', error);
    }
  }, []);

  useEffect(() => {
    fetchEventOptions();
  }, [fetchEventOptions]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      fetchLogs();
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      fetchLogs();
    }
  };

  const areFiltersEmpty = () => {
    return !date && !event && !recipient && !sender && !subject;
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const formatToBackendDate = (dateString) => {
    // Formato esperado para el backend: 'yyyy-mm-dd'
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e) => {
    // Formato de visualización esperado: 'dd-mm-yyyy'
    const backendDate = e.target.value; // 'yyyy-mm-dd'
    const [year, month, day] = backendDate.split('-');
    setDate(`${day}-${month}-${year}`);
  };

  useEffect(() => {
    if (areFiltersEmpty()) {
      fetchLogs();
    }
  }, [fetchLogs]);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token
    window.location.href = '/'; // Redirigir al login
  };

  return (
    <div className="container">
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
      <h2 style={{ textAlign: 'center' }}>Tabla logs</h2>
      <div className="filter-container">
        <span style={{ marginRight: '10px' }}>Filtros:</span>

        <input
          type="date"
          value={date ? formatToBackendDate(date) : ''} // Mostrar el valor en 'dd-mm-yyyy'
          onChange={handleDateChange}
        />

        <select value={event} onChange={(e) => setEvent(e.target.value)}>
          <option value="">Seleccionar evento</option>
          {eventOptions.map((eventOption) => (
            <option key={eventOption} value={eventOption}>
              {eventOption}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enviado a"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Asunto"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enviado desde"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          Buscar
        </button>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Cargando...</div>
      ) : (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Enviado a</th>
                <th>Asunto</th>
                <th>Enviado desde</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7">No hay datos en la tabla</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.date}</td>
                    <td>{log.event}</td>
                    <td>{log.recipient}</td>
                    <td>{log.subject}</td>
                    <td>{log.from}</td>
                    <td>
                      <a href={log.url} target="_blank" rel="noopener noreferrer">
                        {log.url}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span className="pagination-info">
          No. Página {page} de {totalPages}
        </span>
        <button
          className="pagination-button"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default LogDisplay;