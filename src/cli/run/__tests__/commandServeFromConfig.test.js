import * as path from 'path'

import Restapify from '../../../../src/Restapify'
import { cli } from '../../../../src/cli/cli'

import jsonConfig from '../../../../test/restapify.config.json'
import jsConfig from '../../../../test/restapify.config'

const consoleLogSpy = jest.spyOn(global.console, 'log')
const runSpy = jest.fn()
const onSpy = jest.fn()
const onErrorSpy = jest.fn()
jest.mock('../../../../src/Restapify')
Restapify.mockImplementation(() => {
  return {
    run: runSpy,
    on: onSpy,
    onError: onErrorSpy
  }
})

const pathToApiFolder = path.resolve(__dirname, '../../../../test/api')
const pathToJsonConfigFile = path.resolve(__dirname, '../../../../test/restapify.config.json')
const pathToJsConfigFile = path.resolve(__dirname, '../../../../test/restapify.config.js')

describe('Test `restapify` command', () => {
  beforeEach(() => {
    Restapify.mockClear();
  })

  afterEach(() => {
    consoleLogSpy.mockClear()
  })

  it('should init Restapify\'s instance with options in json config files', () => {
    const expectedOptionsInConstuctor = {
      ...jsonConfig,
      rootDir: pathToApiFolder
    }
    const args = `yarn restapify ${pathToJsonConfigFile}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })

  it('should init Restapify\'s instance with options in js config files', () => {
    const expectedOptionsInConstuctor = {
      ...jsConfig,
      rootDir: pathToApiFolder
    }
    const args = `yarn restapify ${pathToJsConfigFile}`
    cli(args.split(' '))

    expect(Restapify.mock.calls.length).toBe(1)
    expect(Restapify.mock.calls[0][0]).toStrictEqual(expectedOptionsInConstuctor)
  })

  it('should output an error on invalid config file path', () => {
    const invalidFilePath = path.resolve(__dirname, 'foobar.json')
    const args = `yarn restapify ${invalidFilePath}`
    cli(args.split(' '))

    const logOutput = consoleLogSpy.mock.calls[0][0]

    expect(logOutput).toEqual(
      expect.stringContaining((`The given configuration file ${invalidFilePath} doesn't exist!`))
    )
  })

  it('should output an error if given path is a folder', () => {
    const invalidFolderPath = path.resolve(__dirname)
    const args = `yarn restapify ${invalidFolderPath}`
    cli(args.split(' '))

    const logOutput = consoleLogSpy.mock.calls[0][0]

    expect(logOutput).toEqual(
      expect.stringContaining((`The given path ${invalidFolderPath} is not a valid configuration file!`))
    )
  })

  it('should output errors on invalid config file', () => {
    const invalidConfigFilePath = path.resolve(__dirname, '../../../../test/restapify.config.invalid.json')
    const args = `yarn restapify ${invalidConfigFilePath}`
    cli(args.split(' '))

    expect(consoleLogSpy.mock.calls[0][0]).toMatchSnapshot()
    expect(consoleLogSpy.mock.calls[1][0]).toMatchSnapshot()
  })
})
