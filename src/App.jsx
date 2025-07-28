import React, { useState, useEffect, useMemo, useCallback } from "react";

const ModernTodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Composants d'icônes simples
  const Icon = ({ type, className = "w-5 h-5", ...props }) => {
    const icons = {
      plus: "➕",
      check: "✓",
      x: "✕",
      calendar: "📅",
      sun: "☀️",
      moon: "🌙",
      trash: "🗑️",
      save: "💾",
      download: "⬇️",
      search: "🔍",
      edit: "✏️",
      tag: "🏷️",
      bell: "🔔",
      clock: "⏰",
      circle: "○",
      checkCircle: "✅",
      alert: "⚠️",
      filter: "🔽",
      upload: "⬆️",
      heart: "❤️",
      code: "💻",
      linkedin: "💼",
      github: "🐱",
      email: "📧",
      globe: "🌍"
    };

    return (
      <span 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ fontSize: className.includes('w-3') ? '0.75rem' : className.includes('w-4') ? '0.875rem' : '1rem' }}
        {...props}
      >
        {icons[type] || "•"}
      </span>
    );
  };

  // Clés pour le stockage (utilisation de variables au lieu de localStorage)
  const [savedTasks, setSavedTasks] = useState([]);
  const [savedDarkMode, setSavedDarkMode] = useState(false);
  const [savedFilter, setSavedFilter] = useState("all");

  // Fonction pour simuler la sauvegarde
  const saveData = useCallback(() => {
    try {
      setSavedTasks([...tasks]);
      setSavedDarkMode(darkMode);
      setSavedFilter(filter);
      setLastSaved(new Date());
      console.log("💾 Données sauvegardées automatiquement");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
    }
  }, [tasks, darkMode, filter]);

  // Sauvegarder automatiquement quand les données changent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tasks.length > 0) {
        saveData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [tasks, darkMode, filter, saveData]);

  // Fonction pour exporter les données
  const exportData = useCallback(() => {
    try {
      const dataToExport = {
        tasks,
        darkMode,
        filter,
        exportedAt: new Date().toISOString(),
        version: "2.0",
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `todolist_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("📤 Données exportées avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de l'exportation:", error);
    }
  }, [tasks, darkMode, filter]);

  // Fonction pour importer les données
  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          if (importedData.tasks && Array.isArray(importedData.tasks)) {
            setTasks(importedData.tasks);
            if (importedData.darkMode !== undefined)
              setDarkMode(importedData.darkMode);
            if (importedData.filter) setFilter(importedData.filter);

            setTimeout(saveData, 100);
            alert(
              `✅ Données importées avec succès ! ${importedData.tasks.length} tâches récupérées.`
            );
            console.log("📥 Données importées avec succès");
          } else {
            alert("❌ Format de fichier invalide.");
          }
        } catch (error) {
          console.error("❌ Erreur lors de l'importation:", error);
          alert("❌ Erreur lors de l'importation du fichier.");
        }
      };
      reader.readAsText(file);
    }
  }, [saveData]);

  // Fonction pour effacer toutes les données
  const clearAllData = useCallback(() => {
    if (
      window.confirm(
        "⚠️ Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible."
      )
    ) {
      try {
        setTasks([]);
        setDarkMode(false);
        setFilter("all");
        setSearchTerm("");
        setCategoryFilter("all");
        setLastSaved(null);
        console.log("🗑️ Toutes les données ont été effacées");
        alert("✅ Toutes les données ont été effacées avec succès.");
      } catch (error) {
        console.error("❌ Erreur lors de l'effacement:", error);
      }
    }
  }, []);

  // Ajouter une nouvelle tâche
  const addTask = useCallback((e) => {
    e.preventDefault();
    if (newTask.trim() !== "") {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString().split("T")[0],
        priority: "medium",
        category: newTaskCategory.trim() || "Général",
        dueDate: newTaskDueDate || null,
        updatedAt: new Date().toISOString(),
      };
      setTasks(prev => [task, ...prev]);
      setNewTask("");
      setNewTaskCategory("");
      setNewTaskDueDate("");
    }
  }, [newTask, newTaskCategory, newTaskDueDate]);

  // Basculer l'état d'une tâche
  const toggleTask = useCallback((id) => {
    setTasks(prev =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }, []);

  // Supprimer une tâche
  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter((task) => task.id !== id));
  }, []);

  // Changer la priorité d'une tâche
  const changePriority = useCallback((id, priority) => {
    setTasks(prev =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              priority,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }, []);

  // Commencer l'édition d'une tâche
  const startEditing = useCallback((task) => {
    setEditingTask(task.id);
    setEditingText(task.text);
  }, []);

  // Sauvegarder l'édition
  const saveEdit = useCallback(() => {
    if (editingText.trim() !== "") {
      setTasks(prev =>
        prev.map((task) =>
          task.id === editingTask
            ? {
                ...task,
                text: editingText.trim(),
                updatedAt: new Date().toISOString(),
              }
            : task
        )
      );
    }
    setEditingTask(null);
    setEditingText("");
  }, [editingTask, editingText]);

  // Annuler l'édition
  const cancelEdit = useCallback(() => {
    setEditingTask(null);
    setEditingText("");
  }, []);

  // Obtenir les catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(tasks.map(task => task.category))];
    return uniqueCategories.sort();
  }, [tasks]);

  // Vérifier si une tâche est en retard
  const isOverdue = useCallback((task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }, []);

  // Vérifier si une tâche est due bientôt (dans les 3 prochains jours)
  const isDueSoon = useCallback((task) => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }, []);

  // Filtrer les tâches avec optimisation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtre par statut
      const statusMatch = 
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "completed" && task.completed) ||
        (filter === "overdue" && isOverdue(task)) ||
        (filter === "due-soon" && isDueSoon(task));

      // Filtre par recherche
      const searchMatch = searchTerm === "" || 
        task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par catégorie
      const categoryMatch = categoryFilter === "all" || task.category === categoryFilter;

      return statusMatch && searchMatch && categoryMatch;
    });
  }, [tasks, filter, searchTerm, categoryFilter, isOverdue, isDueSoon]);

  // Statistiques optimisées
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;
    const overdue = tasks.filter(task => isOverdue(task)).length;
    const dueSoon = tasks.filter(task => isDueSoon(task)).length;

    return { total, completed, active, overdue, dueSoon };
  }, [tasks, isOverdue, isDueSoon]);

  // Format de la dernière sauvegarde
  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return "Jamais";
    const now = new Date();
    const diff = now - lastSaved;

    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return lastSaved.toLocaleDateString();
  }, [lastSaved]);

  // Classes CSS conditionnelles
  const containerClass = `min-h-screen transition-all duration-300 ${
    darkMode
      ? "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
      : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
  }`;

  const cardClass = `backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-300 ${
    darkMode
      ? "bg-white/10 border-white/20 text-white"
      : "bg-white/80 border-white/40 text-gray-800"
  }`;

  return (
    <div className={containerClass}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20">
                <img
                  src="./image.png"
                  alt="Description"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-left">
                <h1
                  className={`text-2xl sm:text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                Tâche-liste Pro
                </h1>
                <p
                  className={`text-xs sm:text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Organisez votre journée avec style
                </p>
                <div
                  className={`text-xs mt-1 flex items-center space-x-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Icon type="save" className="w-3 h-3" />
                  <span>Sauvegarde: {formatLastSaved()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  : "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
              }`}
              aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              <Icon type={darkMode ? "sun" : "moon"} />
            </button>
          </div>

          {/* Statistiques améliorées */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className={cardClass + " p-3 sm:p-4"}>
              <div className="text-xl sm:text-2xl font-bold text-blue-500">{stats.total}</div>
              <div className="text-xs sm:text-sm opacity-70">Total</div>
            </div>
            <div className={cardClass + " p-3 sm:p-4"}>
              <div className="text-xl sm:text-2xl font-bold text-orange-500">{stats.active}</div>
              <div className="text-xs sm:text-sm opacity-70">Actives</div>
            </div>
            <div className={cardClass + " p-3 sm:p-4"}>
              <div className="text-xl sm:text-2xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-xs sm:text-sm opacity-70">Terminées</div>
            </div>
            <div className={cardClass + " p-3 sm:p-4 col-span-1 sm:col-span-1"}>
              <div className="text-xl sm:text-2xl font-bold text-red-500">{stats.overdue}</div>
              <div className="text-xs sm:text-sm opacity-70">En retard</div>
            </div>
            <div className={cardClass + " p-3 sm:p-4 col-span-1 sm:col-span-1"}>
              <div className="text-xl sm:text-2xl font-bold text-yellow-500">{stats.dueSoon}</div>
              <div className="text-xs sm:text-sm opacity-70">Bientôt dues</div>
            </div>
          </div>
        </div>

        {/* Actions de sauvegarde */}
        <div className={cardClass + " p-3 sm:p-4 mb-4 sm:mb-6"}>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span
              className={`text-xs sm:text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Gestion des données:
            </span>

            <button
              onClick={exportData}
              className="px-2 sm:px-3 py-1.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Exporter les données"
            >
              <Icon type="download" className="w-3 h-3" />
              <span>Exporter</span>
            </button>

            <label className="px-2 sm:px-3 py-1.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 cursor-pointer focus-within:ring-2 focus-within:ring-green-500">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                aria-label="Importer des données"
              />
              <Icon type="upload" className="w-3 h-3" />
              <span>Importer</span>
            </label>

            <button
              onClick={clearAllData}
              className="px-2 sm:px-3 py-1.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Effacer toutes les données"
            >
              <Icon type="x" className="w-3 h-3" />
              <span>Effacer</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className={cardClass + " p-4 sm:p-6 mb-4 sm:mb-6"}>
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Icon type="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une tâche..."
                className={`w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode
                    ? "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    : "bg-white border-gray-200 text-gray-800 placeholder-gray-500"
                }`}
                aria-label="Rechercher dans les tâches"
              />
            </div>

            {/* Filtres par catégorie */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs sm:text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Catégories:
                </span>
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                    categoryFilter === "all"
                      ? "bg-purple-500 text-white"
                      : darkMode
                      ? "bg-white/10 text-gray-300 hover:bg-white/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Toutes
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                      categoryFilter === category
                        ? "bg-purple-500 text-white"
                        : darkMode
                        ? "bg-white/10 text-gray-300 hover:bg-white/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire d'ajout amélioré */}
        <div className={cardClass + " p-4 sm:p-6 mb-4 sm:mb-6"}>
          <form onSubmit={addTask} className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Ajouter une nouvelle tâche..."
                  className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? "bg-white/10 border-white/20 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-500"
                  }`}
                  aria-label="Texte de la nouvelle tâche"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                aria-label="Ajouter la tâche"
              >
                <Icon type="plus" />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  placeholder="Catégorie (optionnel)"
                  className={`w-full px-4 py-2 text-sm sm:text-base rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? "bg-white/10 border-white/20 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-500"
                  }`}
                  aria-label="Catégorie de la tâche"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className={`w-full px-4 py-2 text-sm sm:text-base rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                  aria-label="Date d'échéance"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Filtres de statut */}
        <div className={cardClass + " p-3 sm:p-4 mb-4 sm:mb-6"}>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: "all", label: "Toutes", icon: null },
              { key: "active", label: "Actives", icon: "circle" },
              { key: "completed", label: "Terminées", icon: "checkCircle" },
              { key: "overdue", label: "En retard", icon: "alert" },
              { key: "due-soon", label: "Bientôt dues", icon: "clock" },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all duration-300 flex items-center space-x-1 sm:space-x-2 ${
                  filter === key
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : darkMode
                    ? "bg-white/10 text-gray-300 hover:bg-white/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label={`Filtrer par ${label.toLowerCase()}`}
              >
                {icon && <Icon type={icon} className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className={cardClass + " p-6 sm:p-8 text-center"}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center opacity-50">
                <Icon type="calendar" className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <p className="text-base sm:text-lg font-medium opacity-70">
                {searchTerm || categoryFilter !== "all"
                  ? "Aucun résultat trouvé"
                  : filter === "all"
                  ? "Aucune tâche pour le moment"
                  : filter === "active"
                  ? "Aucune tâche active"
                  : filter === "completed"
                  ? "Aucune tâche terminée"
                  : filter === "overdue"
                  ? "Aucune tâche en retard"
                  : "Aucune tâche due bientôt"}
              </p>
              <p className="text-xs sm:text-sm opacity-50 mt-2">
                {!searchTerm && categoryFilter === "all" && filter === "all"
                  ? "Commencez par ajouter votre première tâche !"
                  : "Essayez de modifier vos critères de recherche"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`${cardClass} p-3 sm:p-4 hover:scale-[1.02] transition-all duration-300 ${
                  task.completed ? "opacity-70" : ""
                } ${isOverdue(task) ? "border-l-4 border-red-500" : ""} ${
                  isDueSoon(task) ? "border-l-4 border-yellow-500" : ""
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: "slideIn 0.5s ease-out forwards",
                }}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Checkbox custom */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm flex-shrink-0 mt-1 ${
                      task.completed
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 border-green-400 text-white"
                        : darkMode
                        ? "border-white/30 hover:border-white/50 text-white"
                        : "border-gray-300 hover:border-gray-400 text-gray-600"
                    }`}
                    aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  {/* Contenu de la tâche */}
                  <div className="flex-1 min-w-0">
                    {editingTask === task.id ? (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") saveEdit();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className={`flex-1 px-3 py-1 text-sm sm:text-base rounded border ${
                            darkMode
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-white border-gray-200 text-gray-800"
                          }`}
                          autoFocus
                          aria-label="Modifier le texte de la tâche"
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={saveEdit}
                            className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                            aria-label="Sauvegarder les modifications"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                            aria-label="Annuler les modifications"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`text-sm sm:text-lg break-words ${
                            task.completed ? "line-through opacity-60" : ""
                          }`}
                        >
                          {task.text}
                        </p>
                        <div className="flex items-center space-x-2 sm:space-x-3 mt-2 flex-wrap gap-1 sm:gap-0">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              darkMode ? "bg-white/10" : "bg-gray-100"
                            }`}
                          >
                            📅 {task.createdAt}
                          </span>

                          <span
                            className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                              darkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            <Icon type="tag" className="w-3 h-3" />
                            <span className="truncate max-w-20 sm:max-w-none">{task.category}</span>
                          </span>

                          {task.dueDate && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                                isOverdue(task)
                                  ? "bg-red-100 text-red-800"
                                  : isDueSoon(task)
                                  ? "bg-yellow-100 text-yellow-800"
                                  : darkMode
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              <Icon type="bell" className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                              {isOverdue(task) && <span>⚠️</span>}
                              {isDueSoon(task) && !isOverdue(task) && <span>⏰</span>}
                            </span>
                          )}

                          {/* Priorité */}
                          <select
                            value={task.priority}
                            onChange={(e) =>
                              changePriority(task.id, e.target.value)
                            }
                            className={`text-xs px-1 sm:px-2 py-1 rounded-full border-none outline-none cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-purple-500 ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                            aria-label="Changer la priorité"
                          >
                            <option value="low">🟢 Basse</option>
                            <option value="medium">🟡 Moyenne</option>
                            <option value="high">🔴 Haute</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                    {editingTask !== task.id && (
                      <button
                        onClick={() => startEditing(task)}
                        className={`p-1 sm:p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg ${
                          darkMode
                            ? "text-blue-400 hover:bg-blue-500/20"
                            : "text-blue-500 hover:bg-blue-50"
                        }`}
                        aria-label="Modifier la tâche"
                      >
                        ✏️
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`p-1 sm:p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-lg ${
                        darkMode
                          ? "text-red-400 hover:bg-red-500/20"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                      aria-label="Supprimer la tâche"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer avec informations de stockage */}
        {stats.total > 0 && (
          <div className="text-center mt-6 sm:mt-8 space-y-3">
            <div
              className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full ${
                darkMode
                  ? "bg-white/10 text-gray-300"
                  : "bg-white/60 text-gray-600"
              }`}
            >
              <span className="text-xs sm:text-sm">
                {stats.completed} sur {stats.total} tâches terminées
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Barre de progression */}
            <div className="w-full max-w-xs sm:max-w-md mx-auto">
              <div
                className={`h-2 rounded-full overflow-hidden ${
                  darkMode ? "bg-white/10" : "bg-gray-200"
                }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{
                    width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs mt-1 opacity-70">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% terminé
              </p>
            </div>

            {/* Alertes pour les tâches */}
            <div className="flex flex-wrap justify-center gap-2">
              {stats.overdue > 0 && (
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                    darkMode
                      ? "bg-red-500/20 text-red-400"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <Icon type="alert" className="w-3 h-3" />
                  <span className="text-xs">
                    {stats.overdue} tâche{stats.overdue > 1 ? "s" : ""} en retard
                  </span>
                </div>
              )}

              {stats.dueSoon > 0 && (
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                    darkMode
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <Icon type="clock" className="w-3 h-3" />
                  <span className="text-xs">
                    {stats.dueSoon} tâche{stats.dueSoon > 1 ? "s" : ""} due{stats.dueSoon > 1 ? "s" : ""} bientôt
                  </span>
                </div>
              )}
            </div>

            <div
              className={`text-xs px-3 py-1 rounded-full inline-flex items-center space-x-1 ${
                darkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <Icon type="save" className="w-3 h-3" />
              <span>
                Données sauvegardées automatiquement
              </span>
            </div>
          </div>
        )}

        {/* Raccourcis clavier (info) */}
        {stats.total > 0 && (
          <div className="text-center mt-4 sm:mt-6">
            <details
              className={`inline-block text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <summary className="cursor-pointer hover:underline">
                ⌨️ Raccourcis clavier
              </summary>
              <div className="mt-2 space-y-1 p-3 rounded-lg bg-white/5">
                <div><kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">Entrée</kbd> : Ajouter une tâche</div>
                <div><kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">Entrée</kbd> (en édition) : Sauvegarder</div>
                <div><kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">Échap</kbd> (en édition) : Annuler</div>
              </div>
            </details>
          </div>
        )}

        {/* Légende des priorités */}
        {stats.total > 0 && (
          <div className="text-center mt-4">
            <div
              className={`inline-block text-xs px-4 py-2 rounded-lg ${
                darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className="font-medium">Priorités:</span>
              <span className="ml-2">🟢 Basse</span>
              <span className="ml-2">🟡 Moyenne</span>
              <span className="ml-2">🔴 Haute</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Auteur */}
      <footer className={`mt-8 sm:mt-12 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
          <div className={cardClass + " p-4 sm:p-6"}>
            <div className="text-center space-y-4">
              {/* Photo et nom de l'auteur */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                  <Icon type="code" className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Développé avec <Icon type="heart" className="w-4 h-4 text-red-500 inline mx-1" /> par
                  </h3>
                  <p className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent`}>
                    HOUNKPE Ezechiel
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    Développeur Front-end react et PHP
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                <p className="mb-3">
                  Cette application de gestion des tâches a été conçue avec une approche moderne, 
                  privilégiant l'expérience utilisateur et l'accessibilité. Construite avec React et Tailwind CSS.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    ⚛️ React
                  </span>
                  <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>
                    🎨 Tailwind CSS
                  </span>
                  <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
                    📱 Responsive Design
                  </span>
                </div>
              </div>

              {/* Liens sociaux */}
              <div className="flex justify-center space-x-4 sm:space-x-6">
                <a
                  href="https://github.com/ezechielben06"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                  aria-label="Profil GitHub"
                >
                  <Icon type="github" className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">GitHub</span>
                </a>

                <a
                  href="ezechielben06@gmail.com"
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30 hover:text-green-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
                  }`}
                  aria-label="Envoyer un email"
                >
                  <Icon type="email" className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">Email</span>
                </a>

                <a
                  href="https://ezechielben06.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800'
                  }`}
                  aria-label="Visiter le portfolio"
                >
                  <Icon type="globe" className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">Portfolio</span>
                </a>
              </div>

              {/* Copyright et version */}
              <div className={`border-t pt-4 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  © 2025 Tâche-liste Pro| ezechielben - Tous droits réservés
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs">
                  <span className={`inline-flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Version 2.0.0</span>
                  </span>
                  <span className={`hidden sm:inline ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Fait avec passion au BENIN Cotonou 
                  </span>
                </div>
              </div>

              {/* Message motivant */}
              <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20' : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'}`}>
                <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  ✨ "La productivité n'est pas d'être occupé, mais d'être efficace"
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Merci d'utiliser Tâche-liste Pro pour organiser votre quotidien !
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Amélioration du contraste pour l'accessibilité */
        .high-contrast {
          filter: contrast(1.2);
        }

        /* Focus visible amélioré */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }

        /* Animation pour les nouvelles tâches */
        @keyframes taskAdd {
          0% {
            opacity: 0;
            transform: translateX(-20px) scale(0.95);
          }
          50% {
            transform: translateX(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .task-new {
          animation: taskAdd 0.4s ease-out;
        }

        /* Style pour les éléments kbd */
        kbd {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", monospace;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 0.25rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
        }

        /* Responsive amélioré pour iPhone */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          /* Statistiques responsive */
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .grid-cols-5 > div:nth-child(n+4) {
            grid-column: span 1;
          }

          /* Amélioration des flex wraps */
          .flex-wrap {
            gap: 0.5rem;
          }
          
          /* Boutons plus accessibles sur mobile */
          button {
            min-height: 44px;
          }

          /* Input plus grands sur mobile */
          input, select {
            min-height: 44px;
          }

          /* Texte plus lisible */
          .text-xs {
            font-size: 0.75rem;
          }

          .text-sm {
            font-size: 0.875rem;
          }
        }

        /* Amélioration pour très petits écrans (iPhone SE) */
        @media (max-width: 375px) {
          .container {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }

          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }

          .space-x-3 > * + * {
            margin-left: 0.5rem;
          }

          .gap-2 {
            gap: 0.25rem;
          }
        }

        /* Amélioration de la lisibilité */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01s !important;
            transition-duration: 0.01s !important;
          }
        }

        /* Mode haut contraste pour l'accessibilité */
        @media (prefers-contrast: high) {
          .backdrop-blur-xl {
            backdrop-filter: none;
            background: var(--bg-solid) !important;
          }
        }

        /* Support pour les thèmes de couleur du système */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-solid: #1f2937;
          }
        }

        @media (prefers-color-scheme: light) {
          :root {
            --bg-solid: #ffffff;
          }
        }

        /* Amélioration des checkbox personnalisées */
        .custom-checkbox {
          position: relative;
          cursor: pointer;
        }

        .custom-checkbox:before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .custom-checkbox:hover:before {
          opacity: 0.1;
        }

        /* Style pour les sélecteurs de priorité */
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }

        /* Amélioration de l'accessibilité des formulaires */
        input:invalid {
          border-color: #ef4444;
        }

        input:valid {
          border-color: #10b981;
        }

        /* Animation de la barre de progression */
        @keyframes progressGrow {
          from {
            width: 0%;
          }
        }

        .progress-bar {
          animation: progressGrow 1s ease-out;
        }

        /* Amélioration de la lisibilité du texte */
        p, span, div {
          line-height: 1.5;
        }

        /* Focus trap pour l'accessibilité */
        .modal:focus-within {
          outline: 2px solid #8b5cf6;
          outline-offset: -2px;
        }

        /* Amélioration des liens du footer */
        footer a {
          text-decoration: none;
        }

        footer a:hover {
          text-decoration: none;
        }

        /* Animation pour le footer */
        footer {
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Amélioration des breakwords pour les longs textes */
        .break-words {
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
        }

        /* Amélioration pour les écrans tactiles */
        @media (hover: none) and (pointer: coarse) {
          .hover\\:scale-105:hover {
            transform: scale(1.02);
          }

          .hover\\:scale-110:hover {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default ModernTodoApp;