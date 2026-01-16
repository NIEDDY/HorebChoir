import { useState, useRef } from 'react';
import { useMembers } from '../context/MembersContext';

export default function Members() {
  const {
    members,
    customColumns,
    updateMember,
    addMember,
    deleteMember,
    addCustomColumn,
    deleteCustomColumn,
    importMembersFromExcel,
  } = useMembers();

  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCellEdit = (id: string, field: string, value: string) => {
    updateMember(id, field, value);
    setEditingCell(null);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addCustomColumn(newColumnName);
      setNewColumnName('');
      setShowAddColumn(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setImportMessage({
        type: 'error',
        text: 'Please select a valid Excel file (.xlsx, .xls) or CSV file.',
      });
      return;
    }

    setImporting(true);
    setImportMessage(null);

    try {
      const result = await importMembersFromExcel(file, importMode === 'replace');
      
      if (result.success) {
        setImportMessage({
          type: 'success',
          text: result.message,
        });
        setTimeout(() => {
          setShowImportDialog(false);
          setImportMessage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000);
      } else {
        setImportMessage({
          type: 'error',
          text: result.message,
        });
      }
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: `Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setImporting(false);
    }
  };

  // Standard columns that are always present
  const standardColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'joinDate', label: 'Join Date' },
  ];

  const allColumns = [
    ...standardColumns,
    ...customColumns.map((col) => ({ key: col, label: col })),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Choir Members</h1>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowImportDialog(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>📤</span>
            Import from Excel
          </button>
          <button
            onClick={() => setShowAddColumn(!showAddColumn)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            {showAddColumn ? 'Cancel' : '+ Add Column'}
          </button>
          <button
            onClick={addMember}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Import Members from Excel</h2>
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportMessage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload an Excel file (.xlsx, .xls) or CSV file with member data. The file should have columns for:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1">
                <li><strong>Name</strong> (required) - Column header should contain "name"</li>
                <li><strong>Email</strong> (optional) - Column header should contain "email"</li>
                <li><strong>Join Date</strong> (optional) - Column header should contain "date" or "join"</li>
                <li>Any additional columns will be imported as custom fields</li>
              </ul>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Mode
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Merge with existing (add new members, keep existing)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Replace all (remove existing members, import new ones)
                    </span>
                  </label>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                disabled={importing}
              />
            </div>

            {importMessage && (
              <div
                className={`p-3 rounded-lg mb-4 ${
                  importMessage.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {importMessage.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportMessage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                disabled={importing}
              >
                Cancel
              </button>
            </div>

            {importing && (
              <div className="mt-4 text-center text-gray-600">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <p className="mt-2">Importing...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Column Form */}
      {showAddColumn && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Column</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name (e.g., Phone, Address, Voice Part)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddColumn();
                }
              }}
            />
            <button
              onClick={handleAddColumn}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add Column
            </button>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {allColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.label}</span>
                      {customColumns.includes(column.key) && (
                        <button
                          onClick={() => deleteCustomColumn(column.key)}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          title="Delete column"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  {allColumns.map((column) => {
                    const isEditing =
                      editingCell?.id === member.id && editingCell?.field === column.key;
                    const value = member[column.key] || '';

                    return (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type={column.key === 'joinDate' ? 'date' : column.key === 'email' ? 'email' : 'text'}
                            defaultValue={String(value)}
                            onBlur={(e) =>
                              handleCellEdit(member.id, column.key, e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCellEdit(
                                  member.id,
                                  column.key,
                                  (e.target as HTMLInputElement).value
                                );
                              }
                            }}
                            className="w-full px-2 py-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ id: member.id, field: column.key })}
                            className="cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                            title="Click to edit"
                          >
                            {column.key === 'name' ? (
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-indigo-600 font-semibold">
                                    {String(value).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {value || 'Click to edit'}
                                </div>
                              </div>
                            ) : column.key === 'joinDate' ? (
                              <div className="text-sm text-gray-600">
                                {value
                                  ? new Date(String(value)).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : 'Click to edit'}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                {value || 'Click to edit'}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm">
        Total Members: {members.length}
        {customColumns.length > 0 && ` • Custom Columns: ${customColumns.length}`}
      </div>
    </div>
  );
}
