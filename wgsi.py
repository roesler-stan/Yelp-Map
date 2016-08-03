import sys
flaskfirst = "/sites/flaskfirst"

if not flaskfirst in sys.path:
    sys.path.insert(0, flaskfirst)

import app as application