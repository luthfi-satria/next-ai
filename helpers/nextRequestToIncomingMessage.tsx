// helpers/NextRequestToIncomingMessage.ts
import { NextRequest } from "next/server"
import { Readable } from "stream"
import { IncomingMessage } from "http"

export class NextRequestToIncomingMessage extends Readable {
  headers: IncomingMessage["headers"]
  method: IncomingMessage["method"]
  url: IncomingMessage["url"]

  constructor(request: NextRequest) {
    super()
    this.headers = Object.fromEntries(request.headers.entries())
    this.method = request.method
    this.url = request.nextUrl.toString()

    if (request.body) {
      const reader = request.body.getReader()
      reader.read().then(
        function process({ done, value }) {
          if (done) {
            this.push(null)
            return
          }
          this.push(value)
          return reader.read().then(process)
        }.bind(this),
      )
    } else {
      this.push(null)
    }
  }
  _read() {}
}
