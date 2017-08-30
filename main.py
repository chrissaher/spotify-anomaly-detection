import os
import json
import requests

cls = lambda: os.system("cls")
cls()

url_request = "https://api.spotify.com/v1/users/chrissaher/playlists/2z6IPqUpF5TGe3uSkP33Kg"

r = requests.get(url_request)
print(r.status_code)
print("end")
