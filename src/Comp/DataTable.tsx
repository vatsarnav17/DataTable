import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './DataTable.css';

interface Table {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const DTable = () => {
  const rowsPerPage = 12;

  const [data, setData] = useState<Table[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<Table[]>([]);
  const [isSelecting, setIsSelecting] = useState(false); // New state for loading spinner

  const fetchData = async (page: number, rows: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=${rows}`
      );
      const json = await response.json();
      setData(json.data || []);
      setTotalRecords(json.pagination.total || 0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page]);

  const onPageChange = (e: any) => {
    setPage(e.page);
    //fetchData(e.page, e.rows);
  };

  const onSelectionChange = async (e: any) => {
    if (e.originalEvent) {
      setSelectedProducts(e.value);
    } else if (e.checked) {
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=1&limit=${totalRecords}`
        );
        const json = await response.json();
        const allData = json.data || [];
        setSelectedProducts(allData);
        setData(allData); 
      } catch (error) {
        console.error('Failed to fetch all data for selection:', error);
      }
    } else {
      
      setSelectedProducts([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const overlay = document.getElementById('overlay');
      if (overlay && !overlay.contains(event.target as Node)) {
        overlay.style.display = 'none';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <DataTable
        value={data}
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        selectionMode="multiple" 
        selection={selectedProducts} 
        onSelectionChange={onSelectionChange}
        lazy
        showGridlines
        loading={loading}
        first={page * rowsPerPage}
        onPage={onPageChange}
        dataKey="id"
      >
        <Column 
          selectionMode="multiple" 
          header={() => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <i 
                className="pi pi-chevron-down" 
                style={{ cursor: 'pointer' }} 
                onClick={() => {
                  const overlay = document.getElementById('overlay');
                  if (overlay) {
                    overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
                  }
                }}
              ></i>
              <div 
                id="overlay" 
                style={{ 
                  display: 'none', 
                  position: 'absolute', 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc', 
                  padding: '1rem', 
                  zIndex: 1000,
                  marginTop: '1rem'
                }}
              >
                <label className="fieldCountInput">Enter no of fields to select:</label>
                <input 
                  type="number" 
                  id="fieldCountInput" 
                  style={{ marginLeft: '0.5rem' }} 
                />
                <button 
                  className='submit-btn' 
                  onClick={async () => {
                    const overlay = document.getElementById('overlay');
                    const inputField = document.getElementById('fieldCountInput') as HTMLInputElement;
                    if (overlay) {
                      overlay.style.display = 'none';
                    }
                    if (inputField) {
                      const fieldCount = parseInt(inputField.value, 10);
                      if (!isNaN(fieldCount) && fieldCount > 0) {
                        setIsSelecting(true); // Show loading spinner
                        let remainingFields = fieldCount;
                        let currentPage = 0;
                        const selected = [];

                        while (remainingFields > 0) {
                          const response = await fetch(
                            `https://api.artic.edu/api/v1/artworks?page=${currentPage + 1}&limit=${rowsPerPage}`
                          );
                          const json = await response.json();
                          const pageData = json.data || [];

                          selected.push(...pageData.slice(0, remainingFields));
                          remainingFields -= pageData.length;
                          currentPage++;

                          if (pageData.length < rowsPerPage) {
                            break; 
                          }
                        }

                        setSelectedProducts(selected);
                        setIsSelecting(false); // Hide loading spinner
                      }
                    }
                  }}
                >
                  Submit
                </button>
                {isSelecting && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    <p>Loading...</p>
                  </div>
                )}
              </div>
            </div>
          )} 
          headerStyle={{ width: '3rem' }} 
        />
        <Column 
            header="#" 
            body={(_, options) => page === 0 ? options.rowIndex + 1 :  (options.rowIndex + 1) + rowsPerPage*(page-1)}
            style={{ width: '3rem', textAlign: 'center' }} 
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscription" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      
      {/* <div style={{ marginTop: '2rem' }}>
        <h3>Selected Fields</h3>
        {isSelecting && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            <p>Loading selected fields...</p>
          </div>
        )}
        <DataTable
          value={selectedProducts}
          showGridlines
          selectionMode="multiple"
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          dataKey="id"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Origin" />
          <Column field="artist_display" header="Artist" />
          <Column field="inscriptions" header="Inscription" />
          <Column field="date_start" header="Start Date" />
          <Column field="date_end" header="End Date" />
        </DataTable>
      </div> */}
    </div>
  );
};

export default DTable;
