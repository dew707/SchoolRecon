using System;

namespace SchoolRecon.Domain.Exceptions;

public class EntityNotFoundException : Exception
{
    public EntityNotFoundException(string message) : base(message) { }
}