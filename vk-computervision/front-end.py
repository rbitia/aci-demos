from flask import Flask
from flask import request
import textanalysis, emoji
app = Flask(__name__)

@app.route('/', methods=['GET', 'POST']) #allow both GET and POST requests
def form_example():
    if request.method == 'POST':  #this block is only entered when the form is submitted
        handle = request.form.get('handle')
        avg = textanalysis.main(handle)
        if avg <= .3:
            emojiThing = ":fearful:"
        elif avg <= .5:
            emojiThing = ":expressionless:"
        elif avg <= 1:
            emojiThing = ":yum:"
        return '''<h1>Your twitter handle is: {}</h1>
                  <h1>The avg sentiment of your tweets is: {}</h2>'''.format(handle, avg)

    return '''<form method="POST">
                  Twitter Handle: <input type="text" name="handle"><br>
                  <input type="submit" value="Submit"><br>
              </form>'''
if __name__ == '__main__':
    app.run(debug=True, port=5001) #run app in debug mode on port 5000