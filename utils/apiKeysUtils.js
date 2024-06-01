const validateApiTitle = (title) => {
    if (/[^a-z0-9_-]/.test(title)) {
        return 'API Key title can only contain lowercase letters, numbers, underscores, and hyphens.';
    }
    return null;
};

export { validateApiTitle }