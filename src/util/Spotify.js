let accessToken;
const clientId = "840c74af2b464c5fa168168cc323fa41";
const redirectUri = "http://honingh.surge.sh/";
let userId;

let Spotify = {
    getAccessToken: function(){
        if (accessToken){
            return new Promise(resolve => resolve(accessToken));
        }
        const accessTokenParm = window.location.href.match(/access_token=([^&]*)/);
        const expiresInParm = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenParm && expiresInParm) {
            accessToken = accessTokenParm[1];
            const expiresIn = expiresInParm[1];
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
        }
        else{
            window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&&redirect_uri=${redirectUri}&scope=playlist-modify-public`;
        }
    },

    search: function(searchTerm){
        Spotify.getAccessToken();
        const urlToFetch = `https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
        return fetch(urlToFetch,
            {
                headers: {Authorization: `Bearer ${accessToken}`}
            })
            .then(response => response.json())
            .then(jsonResponse => {
                if (jsonResponse.tracks){
                    return jsonResponse.tracks.items.map(track => {
                        return {
                            id: track.id,
                            name: track.name,
                            artist: track.artists[0].name,
                            album: track.album.name,
                            uri: track.uri
                        };
                    });
                }
            });
    },

    savePlaylist(listName, trackUriList){
        if (!listName || !trackUriList){
            return;
        }
        Spotify.getUserId().then(() => {
            Spotify.createPlaylist(listName).then(id => {
                Spotify.addTracksPlaylist(id, trackUriList).then(id => id);
            });
        });
    },

    getUserId(){
        if (userId){
            return new Promise(resolve => resolve(userId));
        }
        const urlToFetch = `https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/me`;
        return fetch(urlToFetch,
            {
                headers: {Authorization: `Bearer ${accessToken}`}
            })
            .then(response => response.json())
            .then(jsonResponse => {
                if (jsonResponse.id){
                    userId = jsonResponse.id;
                    return userId;
                }
            });
    },

    createPlaylist(playlistName){
        const urlToFetch = `https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/users/${userId}/playlists`;
        return fetch(urlToFetch,
            {
                method: 'POST',
                headers: {Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json; charset=utf-8'},
                body: JSON.stringify({name: playlistName})
            })
            .then(response => response.json())
            .then(jsonResponse => {
                if (jsonResponse.id){
                    return jsonResponse.id;
                }
            });
    },

    addTracksPlaylist(playlistId, trackUriList){
        const urlToFetch = `https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;
        return fetch(urlToFetch,
            {
                method: 'POST',
                headers: {Authorization: `Bearer ${accessToken}`},
                body: JSON.stringify({uris: trackUriList})
            })
            .then(response => response.json())
            .then(jsonResponse => {
                if (jsonResponse.snapshot_id){
                    return jsonResponse.snapshot_id;
                }
            });
    }
};

export default Spotify;