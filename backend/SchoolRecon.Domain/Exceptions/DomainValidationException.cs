using System;
using System.Collections.Generic;

namespace SchoolRecon.Domain.Exceptions;

public class DomainValidationException : Exception
{
    public IEnumerable<string> Errors { get; }

    public DomainValidationException(string message) : base(message)
    {
        Errors = new[] { message };
    }

    public DomainValidationException(IEnumerable<string> errors) : base(string.Join("; ", errors))
    {
        Errors = errors;
    }
}