import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './LogDisplay.css';

const LogDisplay = () => {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState('');
  const [event, setEvent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventOptions, setEventOptions] = useState([]);
  const fetchLogs = useCallback(async () => {
    try {
      const [day, month, year] = date.split('/');
      const response = await axios.get('http://127.0.0.1:8000/get-logs/', {
        params: {
          year: year || null,
          month: month || null,
          day: day || null,
          event: event || null,
          recipient: recipient || null,
          sender: sender || null,
          subject: subject || null,
          page: page,
        },
      });

      setLogs(response.data.logs || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setTotalPages(1);
    }
  }, [date, event, recipient, sender, subject, page]);

  const fetchEventOptions = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/get-events/');
      setEventOptions(response.data.events || []);
    } catch (error) {
      console.error('Error fetching event options:', error);
    }
  }, []);

  useEffect(() => {
    fetchEventOptions();
  }, [fetchEventOptions]);

  const handleNextPage = () => setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const handlePreviousPage = () => setPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center' }}>Tabla logs</h2>
      <div className="filter-container">
        <span style={{ marginRight: '10px' }}>Filtros:</span>
        <input
          type="text"
          placeholder="dd/mm/yy"
          value={date}
          onChange={(e) => {
            const valor = e.target.value;
            const regex = /^\d{0,2}$/;
            const regex2 = /^\d{0,2}\/\d{0,2}$/;
            const regex3 = /^\d{0,2}\/\d{0,2}\/\d{0,2}$/;

            if (valor.length <= 2 && regex.test(valor)) {
              setDate(valor);
            } else if (valor.length <= 5 && regex2.test(valor)) {
              setDate(valor);
            } else if (valor.length <= 10 && regex3.test(valor)) {
              setDate(valor);
            }

            if (valor.length === 2 && regex.test(valor)) {
              setDate(valor + '/');
            } else if (valor.length === 5 && regex2.test(valor)) {
              setDate(valor + '/');
            }
          }}
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
        {/* Botón de buscar */}
        <button className="search-button" onClick={handleSearch}>
          Buscar
        </button>
      </div>

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