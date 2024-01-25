import http.server


class MyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Content-encoding", "br")
        self.end_headers()
        with open("formas.htm.br", "rb") as file:
            self.wfile.write(file.read())


try:
    server = http.server.HTTPServer(('localhost', 1337), MyHandler)
    print("""
Open http://localhost:1337 to watch formas by pestis

This mini http server is only here to pass the Content-Encoding we are missing on file:// compared to the normal environment of a web page
""")
    server.serve_forever()
except KeyboardInterrupt:
    server.socket.close()
