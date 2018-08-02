import httplib, urllib, base64, twitter, os
from pprint import pprint
import json


def sentiment(scoreArray):
    headers = {
    # Request headers
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': '<yourKey>',
    }
    params = urllib.urlencode({
    })
    with open('tweetOutput.json', 'r') as f:
        body= f.read()
    #print (str(body))
    t= open("tweetScores.json","w+")
    try:
        conn = httplib.HTTPSConnection('eastus.api.cognitive.microsoft.com')
        conn.request("POST", "/text/analytics/v2.0/sentiment?%s" % params, body, headers)
        f.close()
        response = conn.getresponse()
        data = response.read()
        scoreData = json.loads(data)
        t.write(json.dumps(scoreData))
        #pprint(scoreData)
        num = 0
        while num< 19:
            scoreArray.append(scoreData['documents'][num]['score'])
            print scoreArray[num]
            num = num + 1
        conn.close()
    except Exception as e:
        print str(e)
    #print scoreArray
    return scoreArray

def tweets():
    api = twitter.Api(consumer_key='2sEZ4ECzxAit4ijPiApU0DZyK',
                  consumer_secret='bgb3CaTh0QENGuMT1MTp4VzXO1dBKnkivZ4cc5EfepBs0X3Lf6',
                  access_token_key='54722501-nGzzqpFE0HVNMKs4lD5PZJ7dHoebP8TTTxCGNypNi',
                  access_token_secret='W1C1ZVk3dNFyurCxs8LYtWlm6bed2ZZ8hNvEGlspJtZr5')
    twitterURL= "https://api.twitter.com/1.1/statuses/home_timeline.json"
    user = "rbitia"
    index = 0
    statuses = api.GetUserTimeline(screen_name="rbitia")
    f= open("tweetOutput.json","w+")
    f.write("{\n\"documents\": [\n" )
    tweets = [i.AsDict() for i in statuses]
    count = 0
    for t in tweets:
        #print( t['text'])
        number = str(index)
        distweet=t['text']
        distweet= distweet.encode('ascii', 'ignore').decode('ascii')
        okay = json.dumps(distweet)
        if index < 20:
            f.write("\n{\n\"language\": \"en\", \n\"id\": \""+ number + "\",\n\"text\":" + okay +"\n},")
        if index == 20:
            f.write("\n{\n\"language\": \"en\", \n\"id\": \""+ number + "\",\n\"text\":" + okay +"\n}")
        index = index + 1
        #print(f.read))
    f.write("\n]\n}")
def calculateAveTweetScore(scoreArray):
    i= 0
    disAvg = 0
    #print len(scoreArray)
    while i<len(scoreArray):
        disAvg = scoreArray[i] + disAvg
        i = i + 1
    if len(scoreArray)!=0:
        avg = disAvg/(len(scoreArray))
        print "WHO AMI"
        print avg
        return avg
    else:
        return 0
def cleanup():
    os.remove("tweetOutput.json")
    os.remove("tweetScores.json")

def main():
    scoreArray = []
    array = []
    tweets()
    array = sentiment(scoreArray)
    #calculateMeanTweet(scoreArray)
    #calaculateHappyTweet(scoreArray)
    calculateAveTweetScore(array)
    cleanup()

if __name__=="__main__":
    main()