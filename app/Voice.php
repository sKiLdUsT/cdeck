<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Voice extends Model
{
    protected $table = 'voice';
    protected $fillable = [
        "id", "uid", "show", "path"
    ];
    public $timestamps = true;
}
