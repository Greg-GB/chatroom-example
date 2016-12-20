'use strict';

const App = require('../src/app');
const Client = require('./client');
const DB = require('../src/db/index');
const rp = require('request-promise');
const config = require('../src/config');
const should = require('should');

describe('Chat Room Tests', function () {
    this.timeout(10000);
    const app = new App();
    const baseUrl = config.baseUrl;
    const client = new Client({url: baseUrl, user: 'Greg'});
    const client2 = new Client({url: baseUrl, user: 'Jessica'});
    const clients = [client, client2];
    const db = new DB(config.host);

    before(() => {
        return db.connect()
            .then(() => db.dropDataBase())
            .then(() => app.start())
            .catch(err => console.log(err))
    });

    after(() => {
        return Promise.all([client.close(), client2.close()])
            .then(() => Promise.all([app.close, db.close()]))
            .catch(err => console.log(err))
    });

    afterEach(() => clients.forEach(client => client.removeAllListeners()));

    it('should join test chat room and receive welcome', (done) => {
        client.listen('welcome', (data) => {
            data.msg.should.equal('Welcome!');
            done();
        });

        let user = {chatRoom: 'test', user: 'Greg'};
        client.sendMsg('join', user)
    });

    it('should send message to test chat room', (done) => {
        client.listen('chatMsg', (data) => {
            data.msg.should.equal('Hello');
            done();
        });

        let user = {chatRoom: 'test', user: 'Greg', msg: 'Hello'};
        client.sendMsg('msg', user);
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
        client.listen('chatMsg', (data) => {
            data.msg.should.equal('Hello2');
            done();
        });

        let user = {chatRoom: 'test', user: 'Greg', msg: 'Hello2'};
        client.sendMsg('msg', user);
    });

    it('test chat room messages should equal 2', () => {
        let options = {
            method: 'GET',
            uri: baseUrl + '/msgs?chatRoom=test',
            json: true
        };

        return rp(options)
            .then(res => res.should.be.length(2));
    });

    it('should notify chat room a user has left', (done) => {
        let user = {chatRoom: 'test', user: 'Jessica'};

        client.listen('left', (data) => {
            data.msg.should.equal(`${user.user} left!`);
            done();
        });

        client2.sendMsg('join', user);
        client2.sendMsg('leave', user);
    });

});
