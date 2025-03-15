import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddEditTemplate from "./AddEditTemplate";

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await window.electron.getTemplates();
            setTemplates(data || []);
        } catch (error) {
            console.error('Failed to load templates:', error);
            setTemplates([]);
        }
    };

    const handleDelete = (template) => {
        setTemplateToDelete(template);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        await window.electron.deleteTemplate(templateToDelete.id);
        setShowDeleteConfirm(false);
        setTemplateToDelete(null);
        loadTemplates();
    };

    return (
        <div>
            {!isAdding && !editingTemplate ? (
                <>
                    <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Templates</h1>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Name</th>
                                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map((template) => (
                                <tr key={template.id}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{template.name}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        <button 
                                            onClick={() => setEditingTemplate(template)}
                                            style={{ marginRight: '10px', padding: '2px 8px' }}
                                        >
                                            EDIT
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(template)}
                                            style={{ padding: '2px 8px' }}
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '20px' }}>
                        <button 
                            onClick={() => setIsAdding(true)}
                            style={{ padding: '2px 8px' }}
                        >
                            ADD TEMPLATE
                        </button>
                    </div>
                </>
            ) : (
                <AddEditTemplate 
                    template={editingTemplate}
                    onCancel={() => {
                        setIsAdding(false);
                        setEditingTemplate(null);
                    }}
                    onSave={() => {
                        setIsAdding(false);
                        setEditingTemplate(null);
                        loadTemplates();
                    }}
                />
            )}

            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '5px'
                    }}>
                        <p>Are you sure you want to delete this template?</p>
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={confirmDelete}
                                style={{ marginRight: '10px', padding: '2px 8px' }}
                            >
                                YES
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{ padding: '2px 8px' }}
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Templates;