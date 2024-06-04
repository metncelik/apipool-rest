const validateApiTitle = (title) => {
    if (!/^[a-z]/.test(title)) {
        return 'API Key title must start with a lowercase latin letter.';
    }

    
    if(!/\b\w{3,15}\b/.test(title)) {
        return 'API Key title must be between 5 and 15 characters.';
    }
    
    if (/[^a-z0-9_-]/.test(title)) {
        return 'API Key title can only contain lowercase latin letters, numbers, underscores, and hyphens.';
    }
    return null;
};

export { validateApiTitle }