const ValidateSingleton = (function () {
  Validate.prototype.get = function get() {
    return Validate.validate;
  };
  Validate.prototype.set = function set(v) {
    Validate.validate = v;
  };
  function Validate() {}

  function getInstance() {
    if (!Validate.validate) {
      Validate.validate = new Validate();
      delete Validate.prototype.constructor;
    }
    return Validate.validate;
  }
  return {
    getInstance,
  };
})();

const validated = ValidateSingleton.getInstance();
validated.set(false);

export default validated;
