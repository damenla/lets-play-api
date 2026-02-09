import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { Application } from 'express';
import { createApp } from '../app';

// These tests target the API contract described in docs/openapi.yaml.
// They import `createApp()` from `src/app` and exercise the endpoints:
//  - POST /users
//  - GET /users?email={email}
//  - GET /users/{id}
//  - PATCH /users/{id}

describe('Users API (integration)', () => {
    let app: Application

    beforeEach(async () => {
        app = createApp()
    })

    describe('POST /users', () => {
        it('creates a user (201)', async () => {
            const email = `tdd+user+${Date.now()}@example.com`
            const res = await request(app)
                .post('/api/v1/users')
                .send({ email, name: 'Test User' })
                .set('Accept', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('id')
            expect(res.body.email).toBe(email)
            expect(res.body.active).toBe(true)
        })

        it('returns 400 when email missing', async () => {
            const res = await request(app)
                .post('/users')
                .send({ name: 'No Email' })
            expect(res.status).toBe(400)
        })

        it('returns 409 on duplicate email', async () => {
            const email = `dup+${Date.now()}@example.com`
            await request(app).post('/api/v1/users').send({ email })
            const res = await request(app).post('/api/v1/users').send({ email })
            expect(res.status).toBe(409)
        })
    })

    describe('GET /users?email={email}', () => {
        it('returns user when exists (200)', async () => {
            const email = `q+${Date.now()}@example.com`
            const created = await request(app).post('/api/v1/users').send({ email, name: 'Q' })
            expect(created.status).toBe(201)

            const res = await request(app).get('/api/v1/users').query({ email })
            expect(res.status).toBe(200)
            expect(res.body.email).toBe(email)
        })

        it('returns 400 when email query missing', async () => {
            const res = await request(app).get('/users')
            expect(res.status).toBe(400)
        })

        it('returns 404 when not found', async () => {
            const res = await request(app).get('/users').query({ email: 'no-such@example.com' })
            expect(res.status).toBe(404)
        })
    })

    describe('GET /users/{id}', () => {
        it('returns user by id (200)', async () => {
            const email = `id+${Date.now()}@example.com`
            const created = await request(app).post('/api/v1/users').send({ email, name: 'ID' })
            const id = created.body.id

            const res = await request(app).get(`/api/v1/users/${id}`)
            expect(res.status).toBe(200)
            expect(res.body.id).toBe(id)
            expect(res.body.email).toBe(email)
        })

        it('returns 404 for unknown id', async () => {
            const res = await request(app).get('/users/00000000-0000-0000-0000-000000000000')
            expect(res.status).toBe(404)
        })
    })

    describe('PATCH /users/{id}', () => {
        it('updates fields and active status (200)', async () => {
            const email = `patch+${Date.now()}@example.com`
            const created = await request(app).post('/api/v1/users').send({ email, name: 'Patch' })
            const id = created.body.id

            const res = await request(app)
                .patch(`/api/v1/users/${id}`)
                .send({ name: 'Patched', active: false })

            expect(res.status).toBe(200)
            expect(res.body.id).toBe(id)
            expect(res.body.name).toBe('Patched')
            expect(res.body.active).toBe(false)
        })

        it('returns 404 for unknown id', async () => {
            const res = await request(app).patch('/api/v1/users/00000000-0000-0000-0000-000000000000').send({ name: 'X' })
            expect(res.status).toBe(404)
        })

        it('returns 409 when updating to duplicate email', async () => {
            const email1 = `e1+${Date.now()}@example.com`
            const email2 = `e2+${Date.now()}@example.com`
            const c1 = await request(app).post('/api/v1/users').send({ email: email1 })
            const c2 = await request(app).post('/api/v1/users').send({ email: email2 })

            const res = await request(app).patch(`/api/v1/users/${c2.body.id}`).send({ email: email1 })
            expect(res.status).toBe(409)
        })

        it('returns 400 when email format invalid', async () => {
            const email = `invalid+${Date.now()}@example.com`
            const created = await request(app).post('/api/v1/users').send({ email })
            const id = created.body.id

            const res = await request(app).patch(`/api/v1/users/${id}`).send({ email: 'not-an-email' })
            expect(res.status).toBe(400)
        })
    })
})
