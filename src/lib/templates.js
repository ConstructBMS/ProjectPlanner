// Project Templates System
// Handles saving, loading, and applying project templates with proper data management

import { supabase } from '../supabase/client';

// Template structure
export const TEMPLATE_CATEGORIES = {
  CONSTRUCTION: 'construction',
  SOFTWARE: 'software',
  EVENT: 'event',
  MANUFACTURING: 'manufacturing',
  RESEARCH: 'research',
  MARKETING: 'marketing',
  CUSTOM: 'custom',
};

export const TEMPLATE_CATEGORY_LABELS = {
  [TEMPLATE_CATEGORIES.CONSTRUCTION]: 'Construction',
  [TEMPLATE_CATEGORIES.SOFTWARE]: 'Software Development',
  [TEMPLATE_CATEGORIES.EVENT]: 'Event Planning',
  [TEMPLATE_CATEGORIES.MANUFACTURING]: 'Manufacturing',
  [TEMPLATE_CATEGORIES.RESEARCH]: 'Research & Development',
  [TEMPLATE_CATEGORIES.MARKETING]: 'Marketing Campaign',
  [TEMPLATE_CATEGORIES.CUSTOM]: 'Custom',
};

// Default templates
export const DEFAULT_TEMPLATES = [
  {
    id: 'template-construction-basic',
    name: 'Basic Construction Project',
    description: 'Standard construction project template with common phases',
    category: TEMPLATE_CATEGORIES.CONSTRUCTION,
    isDefault: true,
    tasks: [
      {
        name: 'Project Initiation',
        duration: 5,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'Site Survey', duration: 2, type: 'task' },
          { name: 'Permits & Approvals', duration: 10, type: 'task' },
          { name: 'Contractor Selection', duration: 7, type: 'task' },
        ],
      },
      {
        name: 'Site Preparation',
        duration: 8,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'Site Clearing', duration: 3, type: 'task' },
          { name: 'Foundation Work', duration: 5, type: 'task' },
        ],
      },
      {
        name: 'Construction Phase',
        duration: 30,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'Framing', duration: 10, type: 'task' },
          { name: 'Electrical', duration: 8, type: 'task' },
          { name: 'Plumbing', duration: 8, type: 'task' },
          { name: 'Interior Finishing', duration: 12, type: 'task' },
        ],
      },
      {
        name: 'Project Completion',
        duration: 5,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'Final Inspection', duration: 2, type: 'task' },
          { name: 'Handover', duration: 1, type: 'task' },
          { name: 'Project Closeout', duration: 2, type: 'task' },
        ],
      },
    ],
    dependencies: [
      { fromTask: 'Site Survey', toTask: 'Permits & Approvals', type: 'FS', lag: 0 },
      { fromTask: 'Permits & Approvals', toTask: 'Site Clearing', type: 'FS', lag: 0 },
      { fromTask: 'Site Clearing', toTask: 'Foundation Work', type: 'FS', lag: 0 },
      { fromTask: 'Foundation Work', toTask: 'Framing', type: 'FS', lag: 0 },
      { fromTask: 'Framing', toTask: 'Electrical', type: 'SS', lag: 2 },
      { fromTask: 'Framing', toTask: 'Plumbing', type: 'SS', lag: 2 },
      { fromTask: 'Electrical', toTask: 'Interior Finishing', type: 'FF', lag: 0 },
      { fromTask: 'Plumbing', toTask: 'Interior Finishing', type: 'FF', lag: 0 },
      { fromTask: 'Interior Finishing', toTask: 'Final Inspection', type: 'FS', lag: 0 },
      { fromTask: 'Final Inspection', toTask: 'Handover', type: 'FS', lag: 0 },
      { fromTask: 'Handover', toTask: 'Project Closeout', type: 'FS', lag: 0 },
    ],
    resources: [
      { name: 'Project Manager', type: 'Management', capacity: 100 },
      { name: 'Site Engineer', type: 'Engineering', capacity: 100 },
      { name: 'Construction Workers', type: 'Labor', capacity: 200 },
      { name: 'Electrician', type: 'Trade', capacity: 100 },
      { name: 'Plumber', type: 'Trade', capacity: 100 },
    ],
    settings: {
      defaultCalendar: 'standard',
      workingHours: { start: '08:00', end: '17:00' },
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    },
  },
  {
    id: 'template-software-agile',
    name: 'Agile Software Development',
    description: 'Agile software development project with sprints',
    category: TEMPLATE_CATEGORIES.SOFTWARE,
    isDefault: true,
    tasks: [
      {
        name: 'Project Setup',
        duration: 3,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'Requirements Gathering', duration: 5, type: 'task' },
          { name: 'Architecture Design', duration: 7, type: 'task' },
          { name: 'Environment Setup', duration: 2, type: 'task' },
        ],
      },
      {
        name: 'Sprint 1',
        duration: 14,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'Sprint Planning', duration: 1, type: 'task' },
          { name: 'Core Features Development', duration: 10, type: 'task' },
          { name: 'Unit Testing', duration: 5, type: 'task' },
          { name: 'Sprint Review', duration: 1, type: 'task' },
        ],
      },
      {
        name: 'Sprint 2',
        duration: 14,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'Sprint Planning', duration: 1, type: 'task' },
          { name: 'Advanced Features', duration: 10, type: 'task' },
          { name: 'Integration Testing', duration: 5, type: 'task' },
          { name: 'Sprint Review', duration: 1, type: 'task' },
        ],
      },
      {
        name: 'Final Phase',
        duration: 7,
        type: 'task',
        isMilestone: false,
        isGroup: true,
        children: [
          { name: 'System Testing', duration: 3, type: 'task' },
          { name: 'User Acceptance Testing', duration: 2, type: 'task' },
          { name: 'Deployment', duration: 1, type: 'task' },
          { name: 'Project Closure', duration: 1, type: 'task' },
        ],
      },
    ],
    dependencies: [
      { fromTask: 'Requirements Gathering', toTask: 'Architecture Design', type: 'FS', lag: 0 },
      { fromTask: 'Architecture Design', toTask: 'Environment Setup', type: 'FS', lag: 0 },
      { fromTask: 'Environment Setup', toTask: 'Sprint 1', type: 'FS', lag: 0 },
      { fromTask: 'Sprint 1', toTask: 'Sprint 2', type: 'FS', lag: 0 },
      { fromTask: 'Sprint 2', toTask: 'Final Phase', type: 'FS', lag: 0 },
    ],
    resources: [
      { name: 'Product Owner', type: 'Management', capacity: 100 },
      { name: 'Scrum Master', type: 'Management', capacity: 100 },
      { name: 'Senior Developer', type: 'Development', capacity: 100 },
      { name: 'Junior Developer', type: 'Development', capacity: 100 },
      { name: 'QA Engineer', type: 'Testing', capacity: 100 },
      { name: 'DevOps Engineer', type: 'Operations', capacity: 100 },
    ],
    settings: {
      defaultCalendar: 'agile',
      workingHours: { start: '09:00', end: '18:00' },
      workingDays: [1, 2, 3, 4, 5],
    },
  },
];

// Save project as template
export const saveProjectAsTemplate = async (templateData) => {
  try {
    const {
      name,
      description,
      category,
      tasks,
      taskLinks,
      resources,
      settings,
      viewState,
    } = templateData;

    // Validate required fields
    if (!name || !description || !category) {
      throw new Error('Template name, description, and category are required');
    }

    // Prepare template data
    const template = {
      name: name.trim(),
      description: description.trim(),
      category,
      tasks: tasks || [],
      taskLinks: taskLinks || [],
      resources: resources || [],
      settings: settings || {},
      viewState: viewState || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_default: false,
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('project_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }

    console.log('Template saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

// Load all templates
export const loadTemplates = async () => {
  try {
    // Load from Supabase
    const { data: dbTemplates, error } = await supabase
      .from('project_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error loading templates from database:', error);
      // Fallback to default templates
      return DEFAULT_TEMPLATES;
    }

    // Combine database templates with default templates
    const allTemplates = [
      ...DEFAULT_TEMPLATES,
      ...(dbTemplates || []).map(template => ({
        ...template,
        isDefault: false,
      })),
    ];

    return allTemplates;
  } catch (error) {
    console.error('Error loading templates:', error);
    // Fallback to default templates
    return DEFAULT_TEMPLATES;
  }
};

// Load template by ID
export const loadTemplateById = async (templateId) => {
  try {
    // Check if it's a default template
    const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (defaultTemplate) {
      return defaultTemplate;
    }

    // Load from database
    const { data, error } = await supabase
      .from('project_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      throw new Error(`Failed to load template: ${error.message}`);
    }

    return {
      ...data,
      isDefault: false,
    };
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
};

// Apply template to create new project
export const applyTemplate = (template, startDate = new Date()) => {
  try {
    if (!template) {
      throw new Error('Template is required');
    }

    const projectStartDate = new Date(startDate);
    const templateStartDate = template.tasks.length > 0 
      ? new Date(template.tasks[0].startDate || new Date())
      : new Date();

    // Calculate date offset
    const dateOffset = projectStartDate.getTime() - templateStartDate.getTime();

    // Generate new IDs for tasks
    const idMap = new Map();
    const generateNewId = (oldId) => {
      if (!idMap.has(oldId)) {
        idMap.set(oldId, `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      }
      return idMap.get(oldId);
    };

    // Process tasks with new IDs and adjusted dates
    const processedTasks = template.tasks.map(task => {
      const newTask = {
        ...task,
        id: generateNewId(task.id),
        startDate: new Date(new Date(task.startDate || templateStartDate).getTime() + dateOffset).toISOString(),
        endDate: new Date(new Date(task.endDate || templateStartDate).getTime() + dateOffset).toISOString(),
        parentId: task.parentId ? generateNewId(task.parentId) : null,
      };

      // Process children if any
      if (task.children && Array.isArray(task.children)) {
        newTask.children = task.children.map(child => ({
          ...child,
          id: generateNewId(child.id),
          startDate: new Date(new Date(child.startDate || templateStartDate).getTime() + dateOffset).toISOString(),
          endDate: new Date(new Date(child.endDate || templateStartDate).getTime() + dateOffset).toISOString(),
          parentId: newTask.id,
        }));
      }

      return newTask;
    });

    // Process dependencies with new task IDs
    const processedDependencies = (template.taskLinks || []).map(link => {
      const fromTask = template.tasks.find(t => t.name === link.fromTask);
      const toTask = template.tasks.find(t => t.name === link.toTask);

      return {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fromId: fromTask ? generateNewId(fromTask.id) : link.fromId,
        toId: toTask ? generateNewId(toTask.id) : link.toId,
        type: link.type || 'FS',
        lag: link.lag || 0,
      };
    });

    // Process resources with new IDs
    const processedResources = (template.resources || []).map(resource => ({
      ...resource,
      id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    // Create new project data
    const newProject = {
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      tasks: processedTasks,
      taskLinks: processedDependencies,
      resources: processedResources,
      settings: template.settings || {},
      viewState: template.viewState || {},
      templateId: template.id,
      created_at: new Date().toISOString(),
    };

    return newProject;
  } catch (error) {
    console.error('Error applying template:', error);
    throw error;
  }
};

// Delete template
export const deleteTemplate = async (templateId) => {
  try {
    // Don't allow deletion of default templates
    const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (defaultTemplate) {
      throw new Error('Cannot delete default templates');
    }

    const { error } = await supabase
      .from('project_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }

    console.log('Template deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Update template
export const updateTemplate = async (templateId, updates) => {
  try {
    // Don't allow updating default templates
    const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (defaultTemplate) {
      throw new Error('Cannot update default templates');
    }

    const { data, error } = await supabase
      .from('project_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }

    console.log('Template updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

// Get templates by category
export const getTemplatesByCategory = (templates, category) => {
  return templates.filter(template => template.category === category);
};

// Search templates
export const searchTemplates = (templates, searchTerm) => {
  if (!searchTerm) return templates;

  const term = searchTerm.toLowerCase();
  return templates.filter(template =>
    template.name.toLowerCase().includes(term) ||
    template.description.toLowerCase().includes(term) ||
    TEMPLATE_CATEGORY_LABELS[template.category].toLowerCase().includes(term)
  );
};

// Validate template data
export const validateTemplate = (templateData) => {
  const errors = [];

  if (!templateData.name || templateData.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!templateData.description || templateData.description.trim().length === 0) {
    errors.push('Template description is required');
  }

  if (!templateData.category || !TEMPLATE_CATEGORIES[templateData.category]) {
    errors.push('Valid template category is required');
  }

  if (!templateData.tasks || templateData.tasks.length === 0) {
    errors.push('Template must contain at least one task');
  }

  return errors;
};

// Get template statistics
export const getTemplateStats = (template) => {
  const totalTasks = template.tasks.length;
  const totalDependencies = template.taskLinks ? template.taskLinks.length : 0;
  const totalResources = template.resources ? template.resources.length : 0;
  
  // Calculate total duration
  const totalDuration = template.tasks.reduce((sum, task) => {
    return sum + (task.duration || 0);
  }, 0);

  // Count milestones
  const milestones = template.tasks.filter(task => task.isMilestone).length;

  return {
    totalTasks,
    totalDependencies,
    totalResources,
    totalDuration,
    milestones,
  };
};

// Export template to JSON
export const exportTemplate = (template) => {
  try {
    const exportData = {
      ...template,
      exported_at: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
    link.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting template:', error);
    throw error;
  }
};

// Import template from JSON
export const importTemplate = async (file) => {
  try {
    const text = await file.text();
    const templateData = JSON.parse(text);

    // Validate imported template
    const errors = validateTemplate(templateData);
    if (errors.length > 0) {
      throw new Error(`Invalid template: ${errors.join(', ')}`);
    }

    // Save imported template
    const savedTemplate = await saveProjectAsTemplate(templateData);
    return savedTemplate;
  } catch (error) {
    console.error('Error importing template:', error);
    throw error;
  }
};
