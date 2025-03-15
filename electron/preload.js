const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    getExercises: () => ipcRenderer.invoke("getExercises"),
    getExercise: (id) => ipcRenderer.invoke("getExercise", id),
    saveExercise: (exercise) => ipcRenderer.invoke("saveExercise", exercise),
    deleteExercise: (id) => ipcRenderer.invoke("deleteExercise", id),
    getTemplates: () => ipcRenderer.invoke("getTemplates"),
    saveTemplate: (template) => ipcRenderer.invoke("saveTemplate", template),
    deleteTemplate: (id) => ipcRenderer.invoke("deleteTemplate", id),
    getWorkouts: () => ipcRenderer.invoke("getWorkouts"),
    saveWorkout: (workout) => ipcRenderer.invoke("saveWorkout", workout),
    deleteWorkout: (id) => ipcRenderer.invoke("deleteWorkout", id)
});
