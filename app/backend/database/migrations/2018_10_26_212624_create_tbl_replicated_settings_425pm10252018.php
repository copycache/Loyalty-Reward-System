<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblReplicatedSettings425pm10252018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_replicated_settings', function (Blueprint $table) 
        {
            $table->increments('replicated_id');
            $table->string('replicated_name');
            $table->integer('replicated_sponsoring')->default(0);
            $table->tinyInteger('replicated_archived')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
