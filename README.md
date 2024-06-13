# auth-server
An auth server for a 2022/2023 bootcamp capstone. This REST-based API uses JWTs to authenticate users and manages a whitelist of refresh tokens allowing users to re-authenticate without having to sign in multiple times. Currently will validate Google OAuth2 tokens for the companion restaurant app as well.

## Third-Party Compatibility Info

Verifies Google users via OAuth 2.0 
- Additional documentation can be found via [Google Firebase](https://firebase.google.com/docs/auth/admin/verify-id-tokens) 
- Direct [link](https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com)

## Resources and Attributions
Some external UI assets have been sourced from the following free resources...
- Favicon by icons8: <a target="_blank" href="https://icons8.com/icon/21062/bookmark">Bookmark</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

- Favicon SVG from <a target="_blank" href="https://icons8.com/icon/21062/bookmark">Bookmark</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

## License Information (MIT)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

