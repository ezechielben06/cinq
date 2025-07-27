import { useState, useEffect } from 'react';
import { Plus, Check, X, Calendar, Filter, Sun, Moon, Trash2, Save, Download } from 'lucide-react';

const ModernTodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Clés pour localStorage
  const STORAGE_KEYS = {
    TASKS: 'todoapp_tasks',
    DARK_MODE: 'todoapp_darkmode',
    FILTER: 'todoapp_filter'
  };

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  // Sauvegarder automatiquement quand les données changent
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(STORAGE_KEYS.TASKS)) {
      saveData();
    }
  }, [tasks, darkMode, filter]);

  // Fonction pour charger les données depuis localStorage
  const loadData = () => {
    try {
      // Charger les tâches
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
        console.log(`✅ ${parsedTasks.length} tâches chargées depuis le stockage local`);
      }

      // Charger le mode sombre
      const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }

      // Charger le filtre
      const savedFilter = localStorage.getItem(STORAGE_KEYS.FILTER);
      if (savedFilter) {
        setFilter(savedFilter);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    }
  };

  // Fonction pour sauvegarder les données dans localStorage
  const saveData = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
      localStorage.setItem(STORAGE_KEYS.FILTER, filter);
      setLastSaved(new Date());
      console.log('💾 Données sauvegardées automatiquement');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      // Gérer le cas où localStorage est plein
      if (error.name === 'QuotaExceededError') {
        alert('⚠️ Espace de stockage local plein. Certaines données peuvent ne pas être sauvegardées.');
      }
    }
  };

  // Fonction pour exporter les données
  const exportData = () => {
    try {
      const dataToExport = {
        tasks,
        darkMode,
        filter,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `todolist_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('📤 Données exportées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'exportation:', error);
    }
  };

  // Fonction pour importer les données
  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // Vérifier la structure des données
          if (importedData.tasks && Array.isArray(importedData.tasks)) {
            setTasks(importedData.tasks);
            if (importedData.darkMode !== undefined) setDarkMode(importedData.darkMode);
            if (importedData.filter) setFilter(importedData.filter);
            
            // Sauvegarder immédiatement
            setTimeout(saveData, 100);
            
            alert(`✅ Données importées avec succès ! ${importedData.tasks.length} tâches récupérées.`);
            console.log('📥 Données importées avec succès');
          } else {
            alert('❌ Format de fichier invalide. Veuillez sélectionner un fichier d\'exportation valide.');
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'importation:', error);
          alert('❌ Erreur lors de l\'importation du fichier. Vérifiez le format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Fonction pour effacer toutes les données
  const clearAllData = () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
      try {
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.DARK_MODE);
        localStorage.removeItem(STORAGE_KEYS.FILTER);
        setTasks([]);
        setDarkMode(false);
        setFilter('all');
        setLastSaved(null);
        console.log('🗑️ Toutes les données ont été effacées');
        alert('✅ Toutes les données ont été effacées avec succès.');
      } catch (error) {
        console.error('❌ Erreur lors de l\'effacement:', error);
      }
    }
  };

  // Ajouter une nouvelle tâche
  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim() !== '') {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString().split('T')[0],
        priority: 'medium',
        updatedAt: new Date().toISOString()
      };
      setTasks([task, ...tasks]);
      setNewTask('');
    }
  };

  // Basculer l'état d'une tâche
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        updatedAt: new Date().toISOString()
      } : task
    ));
  };

  // Supprimer une tâche
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Changer la priorité d'une tâche
  const changePriority = (id, priority) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        priority,
        updatedAt: new Date().toISOString()
      } : task
    ));
  };

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Statistiques
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const activeTasks = totalTasks - completedTasks;

  // Format de la dernière sauvegarde
  const formatLastSaved = () => {
    if (!lastSaved) return 'Jamais';
    const now = new Date();
    const diff = now - lastSaved;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return lastSaved.toLocaleDateString();
  };

  // Classes CSS conditionnelles
  const containerClass = `min-h-screen transition-all duration-300 ${
    darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
      : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
  }`;

  const cardClass = `backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-300 ${
    darkMode 
      ? 'bg-white/10 border-white/20 text-white' 
      : 'bg-white/80 border-white/40 text-gray-800'
  }`;

  return (
    <div className={containerClass}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Ma Liste de Tâches
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Organisez votre journée avec style
                </p>
                {/* Indicateur de sauvegarde */}
                <div className={`text-xs mt-1 flex items-center justify-center space-x-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Save className="w-3 h-3" />
                  <span>Dernière sauvegarde: {formatLastSaved()}</span>
                </div>
              </div>
            </div>
            
            {/* Toggle Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                  : 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={cardClass + " p-4"}>
              <div className="text-2xl font-bold text-blue-500">{totalTasks}</div>
              <div className="text-sm opacity-70">Total</div>
            </div>
            <div className={cardClass + " p-4"}>
              <div className="text-2xl font-bold text-orange-500">{activeTasks}</div>
              <div className="text-sm opacity-70">Actives</div>
            </div>
            <div className={cardClass + " p-4"}>
              <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
              <div className="text-sm opacity-70">Terminées</div>
            </div>
          </div>
        </div>

        {/* Actions de sauvegarde */}
        <div className={cardClass + " p-4 mb-6"}>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Gestion des données:
            </span>
            
            <button
              onClick={exportData}
              className="px-3 py-1.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Exporter</span>
            </button>
            
            <label className="px-3 py-1.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300 text-sm flex items-center space-x-1 cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <Download className="w-3 h-3 rotate-180" />
              <span>Importer</span>
            </label>
            
            <button
              onClick={clearAllData}
              className="px-3 py-1.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Effacer tout</span>
            </button>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <div className={cardClass + " p-6 mb-6"}>
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask(e)}
                placeholder="Ajouter une nouvelle tâche..."
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode 
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
                }`}
              />
            </div>
            <button
              onClick={addTask}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className={cardClass + " p-4 mb-6"}>
          <div className="flex flex-wrap gap-2 justify-center">
            {['all', 'active', 'completed'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : darkMode
                    ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? 'Toutes' : filterType === 'active' ? 'Actives' : 'Terminées'}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className={cardClass + " p-8 text-center"}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center opacity-50">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium opacity-70">
                {filter === 'all' ? 'Aucune tâche pour le moment' : 
                 filter === 'active' ? 'Aucune tâche active' : 
                 'Aucune tâche terminée'}
              </p>
              <p className="text-sm opacity-50 mt-2">
                {filter === 'all' ? 'Commencez par ajouter votre première tâche !' : ''}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`${cardClass} p-4 hover:scale-[1.02] transition-all duration-300 ${
                  task.completed ? 'opacity-70' : ''
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'slideIn 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center space-x-4">
                  
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      task.completed
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-400'
                        : darkMode
                        ? 'border-white/30 hover:border-white/50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 text-white" />}
                  </button>

                  {/* Contenu de la tâche */}
                  <div className="flex-1">
                    <p className={`text-lg ${task.completed ? 'line-through opacity-60' : ''}`}>
                      {task.text}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        darkMode ? 'bg-white/10' : 'bg-gray-100'
                      }`}>
                        {task.createdAt}
                      </span>
                      
                      {/* Priorité */}
                      <select
                        value={task.priority}
                        onChange={(e) => changePriority(task.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-none outline-none cursor-pointer ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </select>
                    </div>
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'text-red-400 hover:bg-red-500/20' 
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer avec informations de stockage */}
        {totalTasks > 0 && (
          <div className="text-center mt-8 space-y-3">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              darkMode ? 'bg-white/10 text-gray-300' : 'bg-white/60 text-gray-600'
            }`}>
              <span className="text-sm">
                {completedTasks} sur {totalTasks} tâches terminées
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className={`text-xs px-3 py-1 rounded-full inline-flex items-center space-x-1 ${
              darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <Save className="w-3 h-3" />
              <span>Données sauvegardées automatiquement dans le navigateur</span>
            </div>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default ModernTodoApp;