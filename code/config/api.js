// api config for martha backend

export const API_BASE_URL = "http://martha.jh.shawinigan.info/queries";
export const AUTH_TOKEN = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

// runs a query on martha
export const marthaFetch = async (queryName, params = {}) => {
    const response = await fetch(`${API_BASE_URL}/${queryName}/execute`, {
        method: "POST",
        headers: {
            "auth": AUTH_TOKEN,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });
    return response.json();
};

// martha returns ids with different names so this helps find them
export const resolveId = (obj, ...possibleFields) => {
    for (const field of possibleFields) {
        if (obj[field] !== undefined && obj[field] !== null) {
            return obj[field];
        }
    }
    return null;
};

export const getPostId = (post) => resolveId(post, 'id', 'post_id', 'p_id');
export const getHabitId = (habit) => resolveId(habit, 'id', 'habit_id', 'h_id');
export const getCommunityId = (community) => resolveId(community, 'id', 'community_id', 'c_id');
export const getUserId = (user) => resolveId(user, 'id', 'user_id', 'u_id');

// escape quotes for sql
export const sanitizeForSQL = (str) => {
    if (!str) return '';
    return str.replace(/'/g, "''");
};

// convert an image URL to base64 string
export const urlToBase64 = async (url) => {
    if (!url || url.trim() === '') return '';
    
    // if it's already base64, return as-is
    if (url.startsWith('data:image')) return url;
    
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.log('Could not convert image to base64:', error);
        return url; // fallback to original URL if conversion fails
    }
};

// check if a string is base64 image data
export const isBase64Image = (str) => {
    return str && str.startsWith('data:image');
};
