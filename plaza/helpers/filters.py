
from plaza import app


@app.template_filter('date')
def date_filter(date):
    return date.strftime('%b %d, %Y') 


@app.template_filter('emailize')
def emailize_filter(text):
	words = [word if '@' not in word else '<a href="mailto:{0}">{0}</a>'.format(word) for word in text.split(" ") ]
	return " ".join(words)