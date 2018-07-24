import httplib, urllib, base64
subscription_key = '5e7dfcab689c4fb183528e3cc3b020f4'
assert subscription_key
headers = {
    # Request headers
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': 'd4b89a6cc27d48ca92e708145c580e25',
}

params = urllib.urlencode({
})

with open('tweetOutput.json', 'r') as f:
    body= f.read()
print (str(body))
f= open("tweetScores.json","w+")
try:
    conn = httplib.HTTPSConnection('eastus.api.cognitive.microsoft.com')
    conn.request("POST", "/text/analytics/v2.0/sentiment?%s" % params, str(body), headers)
    response = conn.getresponse()
    data = response.read()
    print(data)
    f.write(data)
    conn.close()
except Exception as e:
    print("[Errno {0}] {1}".format(e.errno, e.strerror))
