import twitter, requests, json, pprint

api = twitter.Api(consumer_key='2sEZ4ECzxAit4ijPiApU0DZyK',
                  consumer_secret='bgb3CaTh0QENGuMT1MTp4VzXO1dBKnkivZ4cc5EfepBs0X3Lf6',
                  access_token_key='54722501-nGzzqpFE0HVNMKs4lD5PZJ7dHoebP8TTTxCGNypNi',
                  access_token_secret='W1C1ZVk3dNFyurCxs8LYtWlm6bed2ZZ8hNvEGlspJtZr5')
#print api.VerifyCredentials()
twitterURL= "https://api.twitter.com/1.1/statuses/home_timeline.json"
user = "rbitia"
index = 0
statuses = api.GetUserTimeline(screen_name=user)
f= open("tweetOutput.json","w+")
f.write("{\n\"documents\": [\n" )
for tweet in statuses:
    print(tweet)

tweets = [i.AsDict() for i in statuses]
for t in tweets:
    print( t['text'])
    number = str(index)
    distweet=t['text']
    distweet= distweet.encode('ascii', 'ignore').decode('ascii')
    f.write("\n{\n\"language\": \"en\", \n\"id\": \""+ number + "\",\n\"text\":\""+ distweet +"\"\n},")
    index = index + 1
    print(f.read)
f.write("\n]\n}")

