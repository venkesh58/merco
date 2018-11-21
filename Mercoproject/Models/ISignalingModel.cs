﻿using System;

namespace Mercoproject.Models
{
    public interface ISignalingModel
    {
        string Message { get; set; }
        Guid Recipient { get; set; }
        Guid Sender { get; set; }
    }
}