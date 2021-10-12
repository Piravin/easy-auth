### Steps to contribute
- fork the repository
- create an issue on which you'll be working on (use a different branche with issue name/no as branch name)
- make a pull request and I'll merge them once tested
- AND don't forget to build those unit test cases with your favourite framework (I'm using jest)

### Overview
- The project consists of an index.ts file which will used to setup the configurations.
- Currently I've built it to work on mongodb but the code is modular in a way that database queries can be separated from the application logic. The `DbAdapters` directory contains programme which makes this possible. Feel free to add support to your favourite database.
- Basic functions required for authentication are contained in `functions` directory.
