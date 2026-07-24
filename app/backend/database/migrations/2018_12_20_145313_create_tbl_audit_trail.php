<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblAuditTrail extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_audit_trail', function (Blueprint $table) 
        {   
            $table->increments('audit_trail_id');
            $table->integer('user_id')->unsigned();
            $table->string('action')->nullable();
            $table->string('old_value')->nullable();
            $table->string('new_value')->nullable();
            $table->dateTime('date_created');

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

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
