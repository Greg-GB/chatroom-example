'use strict';

const App = require('../src/app');
const Client = require('./client');
const DB = require('../src/db/index');
const rp = require('request-promise');
const config = require('../src/config');
const should = require('should');

describe('Chat Room Tests', function () {
    this.timeout(5000);
    let client;
    let client2;
    let clients = [];
    const app = new App();
    const baseUrl = config.baseUrl;
    const db = new DB(config.host);
    const user1 = 'user1';
    const user2 = 'user2';
    const testRoom = 'test';
    const constructMessage = (room, message) => {
        return {chatRoom: room, msg: message}
    };
    const constructTestMessage = (msg) => constructMessage(testRoom, msg);

    before(() => {
        return db.connect()
            .then(() => db.dropDataBase())
            .then(() => app.start())
            .catch(err => console.log(err))
    });

    beforeEach(() => {
        client = new Client({url: baseUrl, user: user1});
        client2 = new Client({url: baseUrl, user: user2});
        clients = [client, client2];
    });

    afterEach(() => {
        clients.forEach(client => {
            client.removeAllListeners();
            client.close();
        });
    });

    after(() => Promise.all([app.close, db.close()])
        .catch(err => console.log(err)));

    it('should disconnect if not authenticated', (done) => {
        client.listen('disconnect', data =>done());

        client.emit('join', testRoom);
    });

    it('should join test chat room and receive welcome', (done) => {
        client.listen('welcome', (data) => {
            data.msg.should.equal('Welcome to the test room!');
            done();
        });

        client.emit('authenticate', {user: user1});
        client.emit('join', testRoom);
    });

    it('should send message to test chat room', (done) => {
        let newMessage = 'Hello';

        client.listen('newMessage', (data) => {
            data.msg.should.equal(newMessage);
            done();
        });

        client.emit('authenticate', {user: user1});
        client.emit('join', testRoom);
        setTimeout(() => client.emit('msg', constructTestMessage(newMessage)), 100);
    });

    it('test chat room messages should equal 1', () => {
        let options = {
            method: 'GET',
            uri: baseUrl + '/msgs?chatRoom=test',
            json: true
        };

        return rp(options)
            .then(res => res.should.be.length(1));
    });

    it('should send another message to test chat room', (done) => {
        let newMessage = 'Hola';

        client.listen('newMessage', (data) => {
            data.msg.should.equal(newMessage);
            done();
        });

        client.emit('authenticate', {user: user1});
        client.emit('join', testRoom);
        setTimeout(() => client.emit('msg', constructTestMessage(newMessage)), 100);
    });

    it('test chat room messages should equal 2', () => {
        let options = {
            method: 'GET',
            uri: baseUrl + '/msgs?chatRoom=test',
            json: true
        };

        return rp(options)
            .then(res => {
                res.should.be.length(2);
                res[0].should.containEql({msg: 'Hello'});
                res[1].should.containEql({msg: 'Hola'});
            });
    });
});
