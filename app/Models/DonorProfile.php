<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'blood_type_id',
        'last_donation_date',
        'total_donations',
        'available_status',
    ];

    protected $casts = [
        'last_donation_date' => 'date',
        'available_status' => 'boolean',
        'total_donations' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bloodType(): BelongsTo
    {
        return $this->belongsTo(BloodType::class);
    }

    public function isAvailable(): bool
    {
        return $this->available_status && $this->user->is_available;
    }
}