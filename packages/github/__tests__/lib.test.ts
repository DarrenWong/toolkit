import * as path from 'path'
import {Context} from '../src/context'
import {PayloadRepository} from '@octokit/webhooks'
import {WebhookPayload} from '../src/interfaces'

/* eslint-disable @typescript-eslint/no-require-imports */

// TODO: https://github.com/actions/toolkit/issues/291, ESLint chokes on the a?.b syntax introduced in Typescript 3.7
/* eslint-disable @typescript-eslint/no-object-literal-type-assertion */

describe('@actions/context', () => {
  let context: Context

  beforeEach(() => {
    process.env.GITHUB_EVENT_PATH = path.join(__dirname, 'payload.json')
    process.env.GITHUB_REPOSITORY = 'actions/toolkit'
    context = new Context()
  })

  it('returns the payload object', () => {
    expect(context.payload).toEqual(require('./payload.json'))
  })

  it('returns an undefined payload if the GITHUB_EVENT_PATH environment variable is falsey', () => {
    delete process.env.GITHUB_EVENT_PATH

    context = new Context()
    expect(context.payload).toEqual(undefined)
  })

  it('returns an undefined payload if the GITHUB_EVENT_PATH environment variable does not point to a file', () => {
    process.env.GITHUB_EVENT_PATH = path.join(__dirname, 'invalidfile.json')

    context = new Context()
    expect(context.payload).toEqual(undefined)
  })

  it('returns attributes from the GITHUB_REPOSITORY', () => {
    expect(context.repo).toEqual({owner: 'actions', repo: 'toolkit'})
  })

  it('returns attributes from the repository payload', () => {
    delete process.env.GITHUB_REPOSITORY
    expect(context.repo).toEqual({owner: 'user', repo: 'test'})
  })

  it("return error for context.repo when repository doesn't exist", () => {
    delete process.env.GITHUB_REPOSITORY
    delete process.env.GITHUB_EVENT_PATH
    context = new Context()
    expect(() => context.repo).toThrowErrorMatchingSnapshot()
  })

  it('returns issue attributes from the repository', () => {
    expect(context.issue).toEqual({
      owner: 'actions',
      repo: 'toolkit',
      number: 1
    })
  })

  it('works with pullRequest payloads', () => {
    delete process.env.GITHUB_REPOSITORY
    context.payload = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_request: {number: 2},
      repository: {owner: {login: 'user'}, name: 'test'} as PayloadRepository
    } as WebhookPayload
    expect(context.issue).toEqual({
      number: 2,
      owner: 'user',
      repo: 'test'
    })
  })

  it('works with payload.number payloads', () => {
    delete process.env.GITHUB_REPOSITORY
    context.payload = {
      number: 2,
      repository: {owner: {login: 'user'}, name: 'test'} as PayloadRepository
    } as WebhookPayload
    expect(context.issue).toEqual({
      number: 2,
      owner: 'user',
      repo: 'test'
    })
  })
})
