<script>

// def load_library(load_data=ops.local_load_data, save_data=ops.local_save_data):
// def run_personal_scan(data_type:str, period:int, path:str, save_func=ops.local_save_data):
// def run_played_scan(save_data=ops.local_save_data, file_list=ops.local_files):
// def get_access_token():
//     logger.log('getting new token')
//     tokens = ops.local_load_data('spotify_auth_tokens.json')
//     refresh_token = os.getenv('SPOTIFY_REFRESH_TOKEN', tokens['refresh_token'])
//     hash_auth = f"Basic {os.getenv('SPOTIFY_HASH')}"
//     data = {'grant_type': 'refresh_token', 'refresh_token': refresh_token}

//     headers = {'Authorization': hash_auth }
//     ret = requests.post('https://accounts.spotify.com/api/token', data=data, headers=headers)
//     if ret.status_code == 200:
//         ret_json = ret.json()
//         ret_token = ret_json.get('access_token')
//         return {
//             'Authorization': f"Bearer {ret_token}",
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//         }

//     else:

// app.get('/login', function(req, res) {
// var scopes = 'user-read-private user-read-email';
// res.redirect('https://accounts.spotify.com/authorize' +
//   '?response_type=code' +
//   '&client_id=' + my_client_id +
//   (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
//   '&redirect_uri=' + encodeURIComponent(redirect_uri));
// });


function validate(redirectURL) {
  // validate the access token
}

function authorize() {
  const redirectURL = browser.identity.getRedirectURL();
  const clientID = "";
  const scopes = ["openid", "email", "profile"];
  let authURL = "https://accounts.spotify.com/authorize";
  authURL += `?client_id=${clientID}`;
  authURL += `&response_type=token`;
  authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
  authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;

  return browser.identity.launchWebAuthFlow({
    interactive: true,
    url: authURL
  });
}

function getAccessToken() {
  return authorize().then(validate);
}

function _() {
    var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
    window.fetch(url);

    chrome.identity.removeCachedAuthToken(
        {token: token},
        function (){
            alert('removed');
        }
    );
}
</script>

<section>

</section>

<style>
</style>
