export default class Singleton {
  constructor (classObject, constructor = null) {
    const instanceKey = `_${classObject.name}singletonInstance`
    if (classObject[instanceKey]) return classObject[instanceKey]
    classObject[instanceKey] = this

    if (constructor) {
      constructor(this)
    }
  }
}
