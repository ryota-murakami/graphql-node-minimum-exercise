var express = require('express')
var path = require('path')
var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    getDie(numSides: Int): RandomDie
    getSimpleRandomInteger: Int
  }
`)

// This class implements the RandomDie GraphQL type
class RandomDie {
  constructor(numSides) {
    this.numSides = numSides
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides)
  }

  roll({ numRolls }) {
    var output = []
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce())
    }
    return output
  }
}

// The root provides the top-level API endpoints
var root = {
  getDie: function({ numSides }) {
    return new RandomDie(numSides || 6)
  },
  getSimpleRandomInteger: function() {
    return Math.round(Math.random() * 1000)
  }
}

var app = express()

app.use(express.static(__dirname))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
)

app.listen(3999)
console.log('Running a GraphQL API server at localhost:3999/graphql')
